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

<<<<<<< HEAD
/**
 * ---------- FedEx helpers (server)
 * Minimal sandbox flow:
 *  - getFedexToken() -> obtains OAuth token from FedEx sandbox
 *  - createFedexShipment(...) -> create shipment using FedEx Ship API
 *
 * IMPORTANT: Adapt request/response bodies to the exact FedEx API version and sandbox
 * response shape returned to your account. The parsing below tries common response paths.
 */

async function getFedexToken() {
  const FEDEX_CLIENT_ID = process.env.FEDEX_CLIENT_ID;
  const FEDEX_CLIENT_SECRET = process.env.FEDEX_CLIENT_SECRET;

  if (!FEDEX_CLIENT_ID || !FEDEX_CLIENT_SECRET) {
    throw new Error('FedEx credentials not configured');
  }

  const resp = await fetch('https://apis-sandbox.fedex.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: FEDEX_CLIENT_ID,
      client_secret: FEDEX_CLIENT_SECRET,
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    console.error('FedEx token error:', txt);
    throw new Error('Failed to get FedEx OAuth token');
  }

  return resp.json(); // { access_token, expires_in, ... }
}

/**
 * createFedexShipment
 * - shipper: { contact, address }
 * - recipient: { contact, address }
 * - packages: array of { weight: { units, value }, dimensions?: { ... } }
 * - serviceType: string like 'FEDEX_GROUND'
 *
 * NOTE: The payload below is a simplified example. Consult FedEx docs for full shape.
 */
async function createFedexShipment({ shipper, recipient, packages, serviceType }, accessToken) {
  // Example endpoint; adapt if your FedEx plan requires a different path
  const url = 'https://apis-sandbox.fedex.com/ship/v1/shipments';

  const body = {
    // This is a simplified example payload — adapt fields required by FedEx
    labelResponseOptions: 'COMMON2D',
    requestedShipment: {
      serviceType: serviceType || 'FEDEX_GROUND',
      shipper,
      recipient,
      // packages -> packages in shape FedEx expects. This is minimal.
      packages: (packages || []).map((p, idx) => ({
        sequenceNumber: idx + 1,
        weight: p.weight || { units: 'LB', value: 1 },
        dimensions: p.dimensions || undefined,
      })),
      // payment/label options may be required; add as needed
      shippingChargesPayment: {
        paymentType: 'SENDER',
      },
    },
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const text = await resp.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    console.warn('Failed to parse FedEx create shipment response as JSON:', e);
    json = null;
  }

  if (!resp.ok) {
    console.error('FedEx create shipment error:', text);
    const errMsg = (json && (json.errors || json)) || text;
    throw new Error('FedEx shipment creation failed: ' + JSON.stringify(errMsg));
  }

  // return parsed JSON (may include tracking in different fields)
  return json;
}

/**
 * Helper: extract tracking number from a FedEx response using common paths
 * (you should adapt this after inspecting your sandbox responses)
 */
function extractTrackingNumberFromFedexResponse(fedexResp) {
  if (!fedexResp) return null;

  // Common paths in different FedEx responses:
  // - output.completedShipmentDetail.masterTrackingId.trackingNumber
  // - output.shipmentResults?.completedShipmentDetail?.masterTrackingId?.trackingNumber
  // - completedShipmentDetail.masterTrackingId.trackingNumber
  // - transactionShipments[0].completedShipmentDetail.masterTrackingId.trackingNumber
  const tryPaths = [
    (r) => r?.output?.completedShipmentDetail?.masterTrackingId?.trackingNumber,
    (r) => r?.output?.transactionShipments?.[0]?.completedShipmentDetail?.masterTrackingId?.trackingNumber,
    (r) => r?.completedShipmentDetail?.masterTrackingId?.trackingNumber,
    (r) => r?.transactionShipments?.[0]?.completedShipmentDetail?.masterTrackingId?.trackingNumber,
    (r) => r?.trackingNumber,
    (r) => r?.shipmentTrackingNumber,
  ];

  for (const fn of tryPaths) {
    try {
      const v = fn(fedexResp);
      if (v) return v;
    } catch (_) {}
  }
  return null;
}

/**
 * ---------- WEBHOOK ROUTE ----------
 */
=======
// ---------- WEBHOOK ROUTE ----------
>>>>>>> 7adb2b9f26f563faa44fc2d70baa7b53557c1c9e
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

<<<<<<< HEAD
    // --- ensure Firestore order has sessionId, payment and customer info ---
    try {
      if (db) {
        const ordersRef = db.collection('orders');

        const paymentFields = {
          sessionId: session.id,
          status: 'Paid',
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          amountReceived:
            session.amount_total != null
              ? Number(session.amount_total) / 100
              : undefined,
          customer: {
            firstName: orderData.firstName || orderData.customer?.firstName || '',
            lastName: orderData.lastName || orderData.customer?.lastName || '',
            email: orderData.email || orderData.customer?.email || session.customer_details?.email || session.customer_email || '',
            phone: (orderData.customer && orderData.customer.phone) || '',
            address: (orderData.customer && orderData.customer.address) || {},
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (orderDocId) {
          // update existing order doc (orderId came from metadata)
          await ordersRef.doc(orderDocId).update(paymentFields);
          console.log('✅ Firestore order updated with payment info:', orderDocId);
        } else {
          // create a new order doc so there's always a Firestore record
          const newOrder = {
            ...orderData,
            ...paymentFields,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          const createdRef = await ordersRef.add(newOrder);
          orderDocId = createdRef.id;
          console.log('✅ Created new Firestore order doc:', orderDocId);
        }
      }
    } catch (err) {
      console.error('❌ Failed to write/update Firestore order in webhook:', err);
    }

    // --- Create FedEx shipment and update Firestore with tracking (idempotent) ---
    try {
      if (db && orderDocId) {
        const ordersRef = db.collection('orders');
        const orderRef = ordersRef.doc(orderDocId);
        const orderSnap = await orderRef.get();
        const existing = orderSnap.exists ? orderSnap.data() : null;

        // idempotency: if tracking already exists, skip
        if (existing && existing.trackingNumber) {
          console.log('Order already has trackingNumber, skipping FedEx creation:', existing.trackingNumber);
        } else {
          // Build shipper object from env (your store address)
          const shipper = {
            contact: {
              personName: process.env.SHOP_CONTACT_NAME || 'Re Hardware Store',
              phoneNumber: process.env.SHOP_CONTACT_PHONE || '0000000000',
            },
            address: {
              streetLines: [process.env.SHOP_ADDRESS_STREET || '123 Main St'],
              city: process.env.SHOP_ADDRESS_CITY || 'City',
              stateOrProvinceCode: process.env.SHOP_ADDRESS_STATE || 'ST',
              postalCode: process.env.SHOP_ADDRESS_ZIP || '00000',
              countryCode: process.env.SHOP_ADDRESS_COUNTRY || 'US',
            },
          };

          // Recipient from orderData.customer (ensure customer.address exists)
          const recipientName = `${orderData.firstName || orderData.customer?.firstName || ''} ${orderData.lastName || orderData.customer?.lastName || ''}`.trim();

          const recipient = {
            contact: {
              personName: recipientName || 'Customer',
              phoneNumber: (orderData.customer && orderData.customer.phone) || '',
            },
            address: {
              streetLines: [orderData.customer?.address?.street || ''],
              city: orderData.customer?.address?.city || '',
              stateOrProvinceCode: orderData.customer?.address?.state || '',
              postalCode: orderData.customer?.address?.zip || '',
              countryCode: orderData.customer?.address?.country || 'US',
            },
          };

          // Packages: derive from orderData.products or a single package
          const packages = (orderData.products && orderData.products.length)
            ? orderData.products.map((p) => ({ weight: { units: 'LB', value: p.weight || 1 } }))
            : [{ weight: { units: 'LB', value: 1 } }];

          // Acquire FedEx token
          let tokenRes = null;
          try {
            tokenRes = await getFedexToken();
          } catch (err) {
            console.error('Failed to get FedEx token:', err);
            throw err;
          }
          const accessToken = tokenRes.access_token;

          // Create shipment
          let fedexResp = null;
          try {
            fedexResp = await createFedexShipment({
              shipper,
              recipient,
              packages,
              serviceType: 'FEDEX_GROUND',
            }, accessToken);
          } catch (err) {
            console.error('FedEx shipment creation failed:', err);
            throw err;
          }

          // Extract tracking number & optional tracking URL from FedEx response
          const trackingNumber = extractTrackingNumberFromFedexResponse(fedexResp);
          const trackingUrl = trackingNumber
            ? `https://www.fedex.com/apps/fedextrack/?tracknumbers=${encodeURIComponent(trackingNumber)}`
            : null;

          // Optionally parse initial tracking events if FedEx returns them
          // This is a placeholder: adapt to response shape that contains scanEvents / trackingEvents
          let initialEvents = [];
          try {
            // try common locations for events (adapt for your FedEx response)
            const maybeEvents =
              fedexResp?.output?.completeTrackResults?.[0]?.trackResults?.[0]?.scanEvents
              || fedexResp?.output?.shipmentResults?.[0]?.scanEvents
              || fedexResp?.scanEvents
              || [];
            if (Array.isArray(maybeEvents)) {
              initialEvents = maybeEvents.map((ev) => ({
                timestamp: ev?.date ? `${ev.date}T${ev.time || '00:00:00'}` : null,
                status: ev?.eventType || ev?.eventDescription || ev?.status,
                description: ev?.eventDescription || '',
                location: ev?.location?.address ? `${ev.location.address.city || ''}, ${ev.location.address.state || ''}` : null,
                raw: ev,
              }));
            }
          } catch (e) {
            console.warn('Failed to parse initial FedEx events', e);
          }

          // Persist tracking info to Firestore
          const updateObj = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          if (trackingNumber) {
            updateObj.trackingNumber = trackingNumber;
            updateObj.trackingUrl = trackingUrl;
            updateObj.status = 'Shipped';
            updateObj.shippedAt = admin.firestore.FieldValue.serverTimestamp();
          }

          if (initialEvents && initialEvents.length) {
            updateObj.trackingEvents = initialEvents;
            updateObj.trackingLastCheckedAt = admin.firestore.FieldValue.serverTimestamp();
          }

          // if no trackingNumber, still update with fedex response for debugging
          if (!trackingNumber) {
            updateObj.fedexResponse = fedexResp || null;
            updateObj.fedexErrorAt = admin.firestore.FieldValue.serverTimestamp();
          }

          await orderRef.update(updateObj);
          console.log('✅ Order updated with FedEx info:', trackingNumber || '(no tracking)');
        }
      }
    } catch (err) {
      console.error('❌ Failed to create FedEx shipment or update order:', err);
      // write an order-level error flag so admin can retry manually
      try {
        if (db && orderDocId) {
          await db.collection('orders').doc(orderDocId).update({
            fedexError: String(err).slice(0, 2000),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } catch (e) { console.error('Also failed to write fedexError', e); }
    }

=======
>>>>>>> 7adb2b9f26f563faa44fc2d70baa7b53557c1c9e
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
