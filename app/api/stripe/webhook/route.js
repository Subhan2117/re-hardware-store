import Stripe from 'stripe';
import admin from 'firebase-admin';
import sgMail from '@sendgrid/mail';

export const runtime = 'nodejs';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const sendgridApiKey = process.env.SENDGRID_API_KEY;

if (!stripeSecret) console.warn('Stripe secret key not set (STRIPE_SECRET_KEY)');
if (!webhookSecret) console.warn('Stripe webhook secret not set (STRIPE_WEBHOOK_SECRET)');
if (!sendgridApiKey) console.warn('SendGrid API key not set (SENDGRID_API_KEY)');

const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;

// Set SendGrid API key
if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

// Initialize Firebase Admin if not already
function initFirebaseAdmin() {
  try {
    if (!admin.apps.length) {
      // If GOOGLE_APPLICATION_CREDENTIALS is set in the environment, admin will pick it up
      admin.initializeApp();
      console.log('Initialized Firebase Admin SDK');
    }
    return admin.firestore();
  } catch (err) {
    console.error('Failed to initialize Firebase Admin SDK', err);
    return null;
  }
}

// Helper function to send order confirmation email
async function sendOrderConfirmationEmail(email, orderData) {
  if (!sendgridApiKey) {
    console.warn('SendGrid API key not configured; skipping email');
    return;
  }

  try {
    const itemsList = orderData.items
      .map((item) => `${item.name} x${item.quantity} @ $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`)
      .join('\n');

    const emailHtml = `
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      
      <p><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>
      
      <h3>Order Items:</h3>
      <pre>${itemsList}</pre>
      
      <h3>Order Summary:</h3>
      <ul>
        <li><strong>Subtotal:</strong> $${orderData.subtotal.toFixed(2)}</li>
        <li><strong>Tax:</strong> $${orderData.tax.toFixed(2)}</li>
        <li><strong>Shipping:</strong> $${orderData.shipping.toFixed(2)}</li>
        <li><strong>Total Paid:</strong> $${orderData.total.toFixed(2)}</li>
      </ul>
      
      <p>You can track your order using the tracking number above.</p>
      <p>Thank you for your business!</p>
    `;

    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@re-hardware-store.com',
      subject: `Order Confirmation - Tracking #${orderData.trackingNumber}`,
      html: emailHtml,
    });

    console.log(`Order confirmation email sent to ${email}`);
  } catch (err) {
    console.error('Failed to send order confirmation email:', err);
  }
}

export async function POST(req) {
  // Read raw body as buffer
  try {
    const sig = req.headers.get('stripe-signature');
    const raw = await req.arrayBuffer();
    const buf = Buffer.from(raw);

    if (!stripe || !webhookSecret) {
      console.warn('Stripe or webhook secret not configured');
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 500 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log('Received Stripe event:', event.type);

    const db = initFirebaseAdmin();
    if (!db) {
      console.error('No Firestore instance available to update orders');
      // but continue to respond 200 so Stripe does not retry excessively while we investigate
    }

    // Handle relevant events
    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      let session = null;
      let paymentIntentId = null;
      let amountReceived = null;
      let orderId = null; // Firestore docId from session metadata

      if (event.type === 'checkout.session.completed') {
        session = event.data.object;
        paymentIntentId = session.payment_intent || null;
        amountReceived = session.amount_total ?? null;
        orderId = session.metadata?.orderId || null; // Extract Firestore docId from metadata
      } else if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object;
        paymentIntentId = pi.id;
        amountReceived = pi.amount_received ?? pi.amount ?? null;
      }

      try {
        if (db) {
          let updated = false;
          const ordersRef = db.collection('orders');

          // Prefer matching by orderId (metadata) if available
          if (orderId) {
            try {
              const orderDoc = await ordersRef.doc(orderId).get();
              if (orderDoc.exists) {
                const orderData = orderDoc.data();
                const update = {
                  status: 'Paid',
                  paidAt: admin.firestore.FieldValue.serverTimestamp(),
                };
                if (paymentIntentId) update.paymentIntent = paymentIntentId;
                if (amountReceived != null) update.amountReceived = (Number(amountReceived) / 100);

                await ordersRef.doc(orderId).update(update);
                console.log('Updated order', orderId, 'to Paid (matched by metadata.orderId)');
                
                // Send confirmation email
                if (orderData.email) {
                  await sendOrderConfirmationEmail(orderData.email, orderData);
                }
                updated = true;
              }
            } catch (err) {
              console.error('Error updating order by orderId:', err);
            }
          }

          // Fallback: match by sessionId if not already updated
          if (!updated && session) {
            const q = await ordersRef.where('sessionId', '==', session.id).limit(1).get();
            if (!q.empty) {
              const doc = q.docs[0];
              const orderData = doc.data();
              const update = {
                status: 'Paid',
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
              };
              if (paymentIntentId) update.paymentIntent = paymentIntentId;
              if (amountReceived != null) update.amountReceived = (Number(amountReceived) / 100);

              await ordersRef.doc(doc.id).update(update);
              console.log('Updated order', doc.id, 'to Paid (matched by sessionId)');
              
              // Send confirmation email
              if (orderData.email) {
                await sendOrderConfirmationEmail(orderData.email, orderData);
              }
              updated = true;
            } else {
              console.warn('No order found with sessionId=', session.id);
            }
          }

          // Fallback: match by paymentIntent if not already updated
          if (!updated && paymentIntentId) {
            const q = await ordersRef.where('paymentIntent', '==', paymentIntentId).limit(1).get();
            if (!q.empty) {
              const doc = q.docs[0];
              const orderData = doc.data();
              const update = {
                status: 'Paid',
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                amountReceived: amountReceived != null ? Number(amountReceived) / 100 : undefined,
              };
              await ordersRef.doc(doc.id).update(update);
              console.log('Updated order', doc.id, 'to Paid (matched by paymentIntent)');
              
              // Send confirmation email
              if (orderData.email) {
                await sendOrderConfirmationEmail(orderData.email, orderData);
              }
            } else {
              console.warn('No order found with paymentIntent=', paymentIntentId);
            }
          }
        } else {
          console.error('No Firestore instance available to update orders');
        }
      } catch (err) {
        console.error('Failed updating order on webhook', err);
      }
    }

    // Return 200 to acknowledge receipt
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error('Unhandled webhook error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
