// app/api/stripe/webhook/route.js
import Stripe from 'stripe';
import admin from 'firebase-admin';
import sgMail from '@sendgrid/mail';

export const runtime = 'nodejs';

// env
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const sendgridFrom = process.env.SENDGRID_FROM_EMAIL || 'noreply@your-store.com';

if (!stripeSecret) console.warn('STRIPE_SECRET_KEY not set');
if (!webhookSecret) console.warn('STRIPE_WEBHOOK_SECRET not set');
if (!sendgridApiKey) console.warn('SENDGRID_API_KEY not set');

const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;
if (sendgridApiKey) sgMail.setApiKey(sendgridApiKey);

// initialize firebase-admin (will use GOOGLE_APPLICATION_CREDENTIALS if set)
function initFirebaseAdmin() {
  try {
    if (!admin.apps.length) {
      admin.initializeApp();
      console.log('Initialized Firebase Admin SDK');
    }
    return admin.firestore();
  } catch (err) {
    console.error('Failed to initialize Firebase Admin SDK', err);
    return null;
  }
} 

// Build an items array for email from available sources
function buildItemsForEmail(orderDocData = {}, metadata = {}) {
  // Prefer cart JSON from metadata (client may have embedded minimal items there)
  try {
    if (metadata.cart) {
      const cart = JSON.parse(metadata.cart);
      if (Array.isArray(cart) && cart.length) {
        return cart.map((it) => ({
          id: it.id,
          name: it.name || it.title || 'Product',
          price: Number(it.price) || 0,
          quantity: Number(it.quantity) || 1,
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to parse metadata.cart:', e);
  }

  // Fallback to Firestore order structure: orderDocData.products expected shape: [{ productId, quantity }]
  if (Array.isArray(orderDocData.products) && orderDocData.products.length) {
    // If product details (name/price) are present in the doc, use them; otherwise, show productId
    return orderDocData.products.map((p) => ({
      id: p.productId ?? p.id ?? 'unknown',
      name: p.name ?? p.title ?? p.productId ?? 'Product',
      price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
      quantity: p.quantity ?? p.qty ?? 1,
    }));
  }

  // Nothing found — return empty list
  return [];
}

async function sendOrderConfirmationEmail(toEmail, orderDocData, itemsForEmail) {
  if (!sendgridApiKey) {
    console.warn('SendGrid not configured; skipping confirmation email');
    return;
  }
  try {
    const itemsHtml = itemsForEmail.length
      ? `<ul>${itemsForEmail
          .map(
            (it) =>
              `<li>${escapeHtml(it.name)} — ${it.quantity} × $${Number(it.price).toFixed(2)} = $${(
                it.quantity * Number(it.price || 0)
              ).toFixed(2)}</li>`
          )
          .join('')}</ul>`
      : '<p>No line items available.</p>';

    const shipping = orderDocData.shippingAddress
      ? `<p>
           <strong>Shipping to:</strong><br/>
           ${escapeHtml(orderDocData.shippingAddress.name || '')}<br/>
           ${escapeHtml(orderDocData.shippingAddress.line1 || '')} ${escapeHtml(orderDocData.shippingAddress.line2 || '')}<br/>
           ${escapeHtml(orderDocData.shippingAddress.city || '')}, ${escapeHtml(orderDocData.shippingAddress.state || '')} ${escapeHtml(orderDocData.shippingAddress.postalCode || '')}<br/>
           ${escapeHtml(orderDocData.shippingAddress.country || '')}
         </p>`
      : '';

    const html = `
      <h2>Thank you for your order!</h2>
      <p>Your order has been received and payment is complete.</p>
      <p><strong>Order:</strong> ${escapeHtml(orderDocData.id || '')}</p>
      <p><strong>Tracking:</strong> ${escapeHtml(orderDocData.trackingNumber || orderDocData.stripeSessionId || '')}</p>

      <h3>Items</h3>
      ${itemsHtml}

      <h3>Summary</h3>
      <ul>
        <li>Subtotal: $${Number(orderDocData.subtotal ?? 0).toFixed(2)}</li>
        <li>Tax: $${Number(orderDocData.tax ?? 0).toFixed(2)}</li>
        <li>Shipping: $${Number(orderDocData.shipping ?? 0).toFixed(2)}</li>
        <li><strong>Total Paid: $${Number(orderDocData.total ?? 0).toFixed(2)}</strong></li>
      </ul>

      ${shipping}

      <p>If you have any questions, reply to this email or contact support.</p>
    `;

    await sgMail.send({
      to: toEmail,
      from: sendgridFrom,
      subject: `Order Confirmation — ${orderDocData.trackingNumber || orderDocData.id || ''}`,
      html,
    });

    console.log('Sent order confirmation to', toEmail);
  } catch (err) {
    console.error('Failed to send confirmation email', err);
  }
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function POST(req) {
  // Read raw body
  try {
    const sig = req.headers.get('stripe-signature');
    const raw = await req.arrayBuffer();
    const buf = Buffer.from(raw);

    if (!stripe || !webhookSecret) {
      console.error('Stripe or webhook secret not configured');
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 500 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log('Stripe webhook event type:', event.type);

    const db = initFirebaseAdmin();
    if (!db) {
      console.error('Firestore not initialized; webhook cannot update orders');
      // continue and return 200 to avoid infinite retries while you fix env
    }

    // Only handle payment success events that matter
    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      let session = null;
      let paymentIntentId = null;
      let amountReceived = null;
      let orderIdFromMetadata = null;

      if (event.type === 'checkout.session.completed') {
        session = event.data.object;
        paymentIntentId = session.payment_intent ?? null;
        amountReceived = session.amount_total ?? null;
        orderIdFromMetadata = session.metadata?.orderId ?? null;
      } else if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object;
        paymentIntentId = pi.id;
        amountReceived = pi.amount_received ?? pi.amount ?? null;
        // If you use payment_intent.succeeded only, you may not have order metadata; we will fallback later
      }

      try {
        if (!db) {
          console.error('No Firestore (db) available; skipping updates');
        } else {
          const ordersRef = db.collection('orders');
          let updated = false;
          let orderDocRef = null;
          let orderDoc = null;

          // 1) Preferred: metadata.orderId
          if (orderIdFromMetadata) {
            orderDocRef = ordersRef.doc(orderIdFromMetadata);
            const snap = await orderDocRef.get();
            if (snap.exists) {
              orderDoc = snap;
              // prepare update object
              const updateObj = {
                status: 'Paid',
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                stripeSessionId: session?.id ?? null,
                trackingNumber: session?.id ?? paymentIntentId ?? null,
              };
              if (paymentIntentId) updateObj.paymentIntent = paymentIntentId;
              if (amountReceived != null) updateObj.amountReceived = Number(amountReceived) / 100;

              // If order doc lacks shippingAddress but metadata contains address fields set in create-checkout-session, populate it:
              const existingData = snap.data();
              if (!existingData.shippingAddress) {
                // build shippingAddress from session.metadata if present
                const md = session?.metadata ?? {};
                const shippingAddress = {
                  name: `${md.firstName || ''} ${md.lastName || ''}`.trim() || md.name || null,
                  line1: md.street || md.line1 || '',
                  line2: md.line2 || '',
                  city: md.city || '',
                  state: md.state || '',
                  postalCode: md.zip || md.postalCode || '',
                  country: md.country || md.countryCode || '',
                };
                // only set it if line1 is present
                if (shippingAddress.line1) {
                  updateObj.shippingAddress = shippingAddress;
                }
              }

              // If order doc lacks customerEmail set it from session customer_details or metadata
              const custEmail = session?.customer_details?.email ?? session?.customer_email ?? session?.metadata?.customer_email ?? null;
              if (custEmail) updateObj.customerEmail = custEmail;

              // Preserve any existing userId/userName on the doc (do not overwrite from metadata blindly)
              await orderDocRef.update(updateObj);
              console.log('Order updated by metadata.orderId:', orderIdFromMetadata);
              updated = true;

              // Prepare for email: get the latest doc data
              const refreshed = await orderDocRef.get();
              const docData = refreshed.data() || {};
              docData.id = orderDocRef.id;

              // Build items for email
              const itemsForEmail = buildItemsForEmail(docData, session?.metadata ?? {});
              const emailTo = docData.customerEmail || docData.userEmail || session?.customer_details?.email || session?.customer_email || null;
              if (emailTo) {
                await sendOrderConfirmationEmail(emailTo, docData, itemsForEmail);
              }
            } else {
              console.warn('Order doc not found for orderId metadata:', orderIdFromMetadata);
            }
          }

          // 2) Fallback: match by session.id stored in sessionId/sessionId field
          if (!updated && session?.id) {
            const q = await ordersRef.where('sessionId', '==', session.id).limit(1).get();
            if (!q.empty) {
              const docSnap = q.docs[0];
              orderDocRef = ordersRef.doc(docSnap.id);
              const orderData = docSnap.data();

              const updateObj = {
                status: 'Paid',
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                stripeSessionId: session.id,
                trackingNumber: session.id,
              };
              if (paymentIntentId) updateObj.paymentIntent = paymentIntentId;
              if (amountReceived != null) updateObj.amountReceived = Number(amountReceived) / 100;

              // fill shippingAddress from metadata if doc doesn't have one
              if (!orderData.shippingAddress) {
                const md = session.metadata ?? {};
                const shippingAddress = {
                  name: `${md.firstName || ''} ${md.lastName || ''}`.trim() || md.name || null,
                  line1: md.street || md.line1 || '',
                  line2: md.line2 || '',
                  city: md.city || '',
                  state: md.state || '',
                  postalCode: md.zip || md.postalCode || '',
                  country: md.country || md.countryCode || '',
                };
                if (shippingAddress.line1) updateObj.shippingAddress = shippingAddress;
              }

              const custEmail = session?.customer_details?.email ?? session?.customer_email ?? session?.metadata?.customer_email ?? null;
              if (custEmail) updateObj.customerEmail = custEmail;

              await orderDocRef.update(updateObj);
              console.log('Order updated by sessionId match:', docSnap.id);
              updated = true;

              // send email
              const refreshed = await orderDocRef.get();
              const docData = refreshed.data() || {};
              docData.id = orderDocRef.id;
              const itemsForEmail = buildItemsForEmail(docData, session?.metadata ?? {});
              const emailTo = docData.customerEmail || docData.userEmail || custEmail || null;
              if (emailTo) {
                await sendOrderConfirmationEmail(emailTo, docData, itemsForEmail);
              }
            } else {
              console.warn('No order matched by session.id:', session.id);
            }
          }

          // 3) Final fallback: match by paymentIntent (if available)
          if (!updated && paymentIntentId) {
            const q2 = await ordersRef.where('paymentIntent', '==', paymentIntentId).limit(1).get();
            if (!q2.empty) {
              const docSnap = q2.docs[0];
              orderDocRef = ordersRef.doc(docSnap.id);
              const orderData = docSnap.data();

              const updateObj = {
                status: 'Paid',
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                amountReceived: amountReceived != null ? Number(amountReceived) / 100 : undefined,
              };
              await orderDocRef.update(updateObj);
              console.log('Order updated by paymentIntent match:', docSnap.id);
              updated = true;

              // send email
              const refreshed = await orderDocRef.get();
              const docData = refreshed.data() || {};
              docData.id = orderDocRef.id;
              const itemsForEmail = buildItemsForEmail(docData, {});
              const emailTo = docData.customerEmail || docData.userEmail || null;
              if (emailTo) {
                await sendOrderConfirmationEmail(emailTo, docData, itemsForEmail);
              }
            } else {
              console.warn('No order matched by paymentIntent:', paymentIntentId);
            }
          }

          if (!updated) {
            console.warn('Webhook could not match this event to any order. Consider logging details for manual reconciliation.');
            // optionally save a record to a "webhookEvents" collection for manual follow-up
            try {
              await db.collection('webhookEvents').add({
                stripeEventId: event.id,
                type: event.type,
                raw: event.data?.object ?? {},
                receivedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
            } catch (e) {
              console.warn('Failed to store webhook event for manual reconciliation', e);
            }
          }
        }
      } catch (err) {
        console.error('Error processing payment event:', err);
      }
    }

    // respond success to Stripe
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error('Unhandled webhook error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

