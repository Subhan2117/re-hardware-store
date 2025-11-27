// app/api/stripe/webhook/route.js
import Stripe from 'stripe';
import { admin, adminDb } from '@/app/api/firebase/firebaseAdmin';
import sgMail from '@sendgrid/mail';

export const runtime = 'nodejs';

// ---------- ENV ----------
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const sendgridFromEmail =
  process.env.SENDGRID_FROM_EMAIL || 'noreply@re-hardware-store.com';

if (!stripeSecret) console.warn('Stripe secret key not set (STRIPE_SECRET_KEY)');
if (!webhookSecret) console.warn('Stripe webhook secret not set (STRIPE_WEBHOOK_SECRET)');
if (!sendgridApiKey) console.warn('SendGrid API key not set (SENDGRID_API_KEY)');

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' })
  : null;

if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

// ---------- HELPERS ----------
function buildOrderDataFromSession(session) {
  const md = session.metadata || {};

  // cart is JSON string from create-checkout-session
  let cartItems = [];
  try {
    if (md.cart) {
      const parsed = JSON.parse(md.cart);
      if (Array.isArray(parsed)) cartItems = parsed;
    }
  } catch (e) {
    console.warn('Failed to parse metadata.cart', e);
  }

  const items = cartItems.map((item) => {
    const name = item.name || item.title || 'Product';
    const quantity = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    return { name, quantity, price };
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // we didn’t store tax/shipping in metadata, so best effort:
  const tax = Number(md.tax || 0);
  const shipping = Number(md.shipping || 0);

  const total =
    session.amount_total != null
      ? Number(session.amount_total) / 100
      : subtotal + tax + shipping;

  const trackingNumber = md.trackingNumber || 'TBD';

  const firstName = md.firstName || '';
  const lastName = md.lastName || '';

  const emailFromSession =
    session.customer_details?.email || session.customer_email || null;

  return {
    email: emailFromSession,
    items,
    subtotal,
    tax,
    shipping,
    total,
    trackingNumber,
    firstName,
    lastName,
  };
}

async function sendOrderConfirmationEmail(email, orderData) {
  if (!sendgridApiKey) {
    console.warn('SendGrid API key not configured; skipping email');
    return;
  }

  if (!email) {
    console.warn('No email to send confirmation to; skipping');
    return;
  }

  try {
    const items = Array.isArray(orderData.items) ? orderData.items : [];

    const itemsList = items
      .map((item) => {
        const name = item.name || 'Item';
        const quantity = Number(item.quantity || 1);
        const price = Number(item.price || 0);
        const lineTotal = quantity * price;

        return `${name} x${quantity} @ $${price.toFixed(
          2
        )} = $${lineTotal.toFixed(2)}`;
      })
      .join('\n');

    const safeNumber = (v) => Number(v || 0);

    const subtotal = safeNumber(orderData.subtotal);
    const tax = safeNumber(orderData.tax);
    const shipping = safeNumber(orderData.shipping);
    const total = safeNumber(orderData.total);
    const trackingNumber = orderData.trackingNumber || 'TBD';

    const html = `
      <h2>Order Confirmation</h2>
      <p>Thank you for your order${
        orderData.firstName ? `, ${orderData.firstName}` : ''
      }!</p>

      <p><strong>Tracking Number:</strong> ${trackingNumber}</p>

      <h3>Order Items:</h3>
      <pre>${itemsList || 'Items not available'}</pre>

      <h3>Order Summary:</h3>
      <ul>
        <li><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</li>
        <li><strong>Tax:</strong> $${tax.toFixed(2)}</li>
        <li><strong>Shipping:</strong> $${shipping.toFixed(2)}</li>
        <li><strong>Total Paid:</strong> $${total.toFixed(2)}</li>
      </ul>

      <p>You can track your order using the tracking number above.</p>
      <p>Thank you for shopping at Re Hardware Store!</p>
    `;

    console.log('📧 Sending email via SendGrid to', email);

    await sgMail.send({
      to: email,
      from: sendgridFromEmail,
      subject: `Order Confirmation - Tracking #${trackingNumber}`,
      html,
    });

    console.log(`✅ Order confirmation email sent to ${email}`);
  } catch (err) {
    console.error('❌ Failed to send order confirmation email:', err);
  }
}

// ---------- WEBHOOK ROUTE ----------
export async function POST(req) {
  try {
    const sig = req.headers.get('stripe-signature');
    const raw = await req.arrayBuffer();
    const buf = Buffer.from(raw);

    if (!stripe || !webhookSecret) {
      console.error('Stripe or webhook secret not configured');
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { status: 500 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log('🔔 Received Stripe event:', event.type);

    // Only handle checkout completion
    if (event.type !== 'checkout.session.completed') {
      // Acknowledge everything else
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
      });
    }

    const session = event.data.object;

    // Firestore Admin instance (from firebaseAdmin.js)
    const db = adminDb;

    const orderId = session.metadata?.orderId || null;
    let orderData = null;
    let orderDocId = null;

    // --- 1) Try to read Firestore order by orderId from metadata ---
    if (db && orderId) {
      try {
        const ordersRef = db.collection('orders');
        const orderDoc = await ordersRef.doc(orderId).get();

        if (orderDoc.exists) {
          orderDocId = orderId;
          orderData = orderDoc.data();

          // Update status + payment info
          const update = {
            status: 'Paid',
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            sessionId: session.id,
            amountReceived:
              session.amount_total != null
                ? Number(session.amount_total) / 100
                : undefined,
          };

          await ordersRef.doc(orderId).update(update);
          console.log('✅ Updated Firestore order:', orderId);
        } else {
          console.warn('⚠️ No Firestore order found with id =', orderId);
        }
      } catch (err) {
        console.error('❌ Error querying Firestore for orderId:', err);
      }
    } else if (!db) {
      console.warn('⚠️ Firestore not available, skipping order update');
    }

    // --- 2) If no Firestore order found, build from session metadata ---
    if (!orderData) {
      console.log('ℹ️ Building order data from Stripe session metadata');
      orderData = buildOrderDataFromSession(session);
    } else {
      // Ensure some fields exist on Firestore-based orderData
      const built = buildOrderDataFromSession(session);
      orderData = {
        ...built,
        ...orderData, // Firestore values win where present
      };
    }

    // --- 3) Decide which email to use ---
    const email =
      orderData.email ||
      session.customer_details?.email ||
      session.customer_email ||
      null;

    // --- 4) Send email ---
    await sendOrderConfirmationEmail(email, orderData);

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error('❌ Unhandled webhook error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
}
