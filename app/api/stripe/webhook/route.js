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

if (!stripeSecret)
  console.warn('Stripe secret key not set (STRIPE_SECRET_KEY)');
if (!webhookSecret)
  console.warn('Stripe webhook secret not set (STRIPE_WEBHOOK_SECRET)');
if (!sendgridApiKey)
  console.warn('SendGrid API key not set (SENDGRID_API_KEY)');

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' })
  : null;

if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

// ---------- HELPERS ----------

/**
 * Parse cart items from Stripe session metadata.
 * Expects session.metadata.cart to be a JSON-encoded array.
 */
function parseCartFromMetadata(metadata) {
  let cartItems = [];
  if (!metadata) return cartItems;

  try {
    if (metadata.cart) {
      const parsed = JSON.parse(metadata.cart);
      if (Array.isArray(parsed)) {
        cartItems = parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse metadata.cart', e);
  }

  console.log('🛒 Raw cart from metadata:', cartItems);
  return cartItems;
}

function buildOrderDataFromSession(session) {
  const md = session.metadata || {};

  const rawCartItems = parseCartFromMetadata(md);

  const items = rawCartItems.map((item) => {
    const name = item.name || item.title || 'Product';
    const quantity = Number(item.quantity || 1);
    const price = Number(item.price || 0);

    // IMPORTANT: This MUST match how you store the Firestore product doc ID
    const productId =
      item.productId || item.id || item.firestoreId || item.product_id || null;

    return { name, quantity, price, productId };
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = md.tax != null ? Number(md.tax) : 0;
  const shipping = md.shipping != null ? Number(md.shipping) : 0;

  const total =
    session.amount_total != null
      ? Number(session.amount_total) / 100
      : subtotal + tax + shipping;

  const trackingNumber = md.trackingNumber || session.id || 'TBD';

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

/**
 * Decrement product stock for each item in the order.
 * Expects each item to have { productId, quantity }.
 */
async function decrementStockForOrderItems(items) {
  if (!adminDb) {
    console.warn('⚠️ adminDb not available, skipping stock decrement');
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    console.warn('⚠️ No items to decrement stock for');
    return;
  }

  console.log('🧺 Items for stock decrement:', items);

  const productsRef = adminDb.collection('products');

  for (const item of items) {
    const quantity = Number(item.quantity || 1);
    const productId =
      item.productId || item.id || item.product_id || item.firestoreId;

    if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
      console.warn(
        'Skipping item in stock decrement, missing productId or invalid quantity:',
        item
      );
      continue;
    }

    await adminDb.runTransaction(async (tx) => {
      let productDocRef = productsRef.doc(String(productId));
      let snap = await tx.get(productDocRef);

      if (!snap.exists) {
        console.warn(
          'No product found by doc.id for productId =',
          productId,
          '– trying field lookup'
        );

        // Try field `id`
        const byIdQuery = productsRef.where('id', '==', productId).limit(1);
        const byIdSnap = await tx.get(byIdQuery);

        if (!byIdSnap.empty) {
          const docSnap = byIdSnap.docs[0];
          productDocRef = docSnap.ref;
          snap = docSnap;
        } else {
          // Try field `sku` as last resort
          const bySkuQuery = productsRef.where('sku', '==', productId).limit(1);
          const bySkuSnap = await tx.get(bySkuQuery);

          if (!bySkuSnap.empty) {
            const docSnap = bySkuSnap.docs[0];
            productDocRef = docSnap.ref;
            snap = docSnap;
          }
        }
      }

      if (!snap.exists) {
        console.warn(
          'No product found at all for stock decrement productId =',
          productId
        );
        return;
      }

      const data = snap.data() || {};
      const currentStockRaw = Number(data.stock ?? 0);
      const currentStock = Number.isFinite(currentStockRaw)
        ? currentStockRaw
        : 0;

      const newStock = Math.max(0, currentStock - quantity);

      tx.update(productDocRef, {
        stock: newStock,
        inStock: newStock > 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `📦 Decremented stock for product ${productId}: ${currentStock} → ${newStock}`
      );
    });
  }

  console.log('✅ Stock decrement finished for all items');
}


// ---------- WEBHOOK ROUTE ----------
export async function POST(req) {
  try {
    if (!stripe || !webhookSecret) {
      console.error('Stripe or webhook secret not configured');
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
        status: 500,
      });
    }

    const sig = req.headers.get('stripe-signature');
    const raw = await req.arrayBuffer();
    const buf = Buffer.from(raw);

    let event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log('🔔 Stripe webhook event received:', {
      eventId: event.id,
      type: event.type,
    });

    if (event.type !== 'checkout.session.completed') {
      console.log(
        'ℹ️ Non checkout.session.completed event received, returning early:',
        event.type
      );
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
      });
    }

    const session = event.data.object;
    console.log('🧾 Checkout session completed:', {
      sessionId: session.id,
      metadata: session.metadata,
    });

    const db = adminDb;

    const orderId = session.metadata?.orderId || null;
    let existingOrderData = null;
    let orderDocId = null;

    // --- 1) Try to read existing Firestore order by orderId (created on client) ---
    if (db && orderId) {
      try {
        console.log(
          '🔍 Looking up existing Firestore order by orderId:',
          orderId
        );
        const ordersRef = db.collection('orders');
        const orderDoc = await ordersRef.doc(orderId).get();

        if (orderDoc.exists) {
          orderDocId = orderId;
          existingOrderData = orderDoc.data();
          console.log('ℹ️ Found existing Firestore order:', orderId);
        } else {
          console.warn('⚠️ No Firestore order found with id =', orderId);
        }
      } catch (err) {
        console.error('❌ Error querying Firestore for orderId:', err);
      }
    } else if (!db) {
      console.warn('⚠️ Firestore not available, skipping order update');
    } else if (!orderId) {
      console.warn(
        '⚠️ No orderId in session.metadata, will create new order doc'
      );
    }

    // --- 2) Always build items from session metadata (this includes productId) ---
    const builtFromSession = buildOrderDataFromSession(session);

    // We'll use this array for stock updates
    const itemsForStock = builtFromSession.items || [];

    // Merge for saving the order: existing Firestore data wins for fields,
    // but we still keep items from Firestore if present.
    let orderData;
    if (!existingOrderData) {
      console.log(
        '🧱 No existing Firestore order data, using builtFromSession only'
      );
      orderData = builtFromSession;
    } else {
      console.log(
        '🧱 Merging existing Firestore order data with builtFromSession'
      );
      orderData = {
        ...builtFromSession,
        ...existingOrderData,
      };
    }

    // --- 3) Decide which email to use ---
    const email =
      orderData.email ||
      session.customer_details?.email ||
      session.customer_email ||
      null;

    // --- 4) Build Firestore order payload ---
    const safeNumber = (v) => Number(v || 0);

    const customerDetails = session.customer_details || null;
    const shippingAddress = customerDetails?.address || null;

    const customerNameFromStripe = customerDetails?.name || null;
    const nameFromMetadata = [orderData.firstName, orderData.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    const customerName = customerNameFromStripe || nameFromMetadata || null;

    const firestoreOrder = {
      // identity
      email,
      customerName,
      firstName: orderData.firstName || null,
      lastName: orderData.lastName || null,

      // items + money
      items: Array.isArray(orderData.items) ? orderData.items : [],
      subtotal: safeNumber(orderData.subtotal),
      tax: safeNumber(orderData.tax),
      shipping: safeNumber(orderData.shipping),
      total: safeNumber(orderData.total),

      // status + Stripe references
      trackingNumber: orderData.trackingNumber || session.id,
      status: 'Paid',
      paymentStatus: session.payment_status || 'paid',
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id,

      shippingAddress,
      customerDetails,

      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    console.log('📝 Firestore order payload ready:', {
      orderDocId: orderDocId || '(new)',
      email,
      total: firestoreOrder.total,
    });

    // --- 5) Upsert into Firestore ---
    if (db) {
      const ordersRef = db.collection('orders');

      if (orderDocId) {
        await ordersRef.doc(orderDocId).set(firestoreOrder, { merge: true });
        console.log('✅ Upserted Firestore order (existing doc):', orderDocId);
      } else {
        const newDocRef = await ordersRef.add({
          ...firestoreOrder,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        orderDocId = newDocRef.id;
        console.log('✅ Created Firestore order from webhook:', orderDocId);
      }
    } else {
      console.warn(
        '⚠️ Skipping Firestore order write, adminDb is not available'
      );
    }

    // --- 6) Decrement product stock based on *session* items (with productId) ---
    console.log('🧺 Preparing to decrement stock for items:', itemsForStock, {
      sessionId: session.id,
      orderDocId,
    });

    try {
      await decrementStockForOrderItems(itemsForStock);
      console.log('✅ Completed stock decrement for session', session.id);
    } catch (e) {
      console.error('❌ Error while decrementing stock (non-fatal):', e);
    }

    // --- 7) Send confirmation email ---
    await sendOrderConfirmationEmail(email, orderData);

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error('❌ Unhandled webhook error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
}
