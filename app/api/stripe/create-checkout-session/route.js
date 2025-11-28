// app/api/stripe/create-checkout-session/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import admin from 'firebase-admin';

export const runtime = 'nodejs';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) console.warn('STRIPE_SECRET_KEY not set in env');

const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;

// Initialize Firebase Admin for server-side Firestore writes (uses GOOGLE_APPLICATION_CREDENTIALS or environment-provided service account)
function initFirebaseAdmin() {
  try {
    if (!admin.apps.length) {
      // admin will use GOOGLE_APPLICATION_CREDENTIALS or environment credentials provided by hosting platform
      admin.initializeApp();
      console.log('Firebase Admin initialized in create-checkout-session route');
    }
    return admin.firestore();
  } catch (err) {
    console.error('Failed to initialize Firebase Admin:', err);
    return null;
  }
}

export async function POST(req) {
  try {
    if (!stripe) {
      console.error('Stripe is not configured (missing STRIPE_SECRET_KEY)');
      return NextResponse.json(
        { error: 'Stripe is not configured on the server' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { items, shipping, tax, contact, shippingDetails, orderId, userId } = body;
    // contact: { firstName, lastName, email, phone }
    // shippingDetails: { street, city, state, zip, country, line2 }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items to checkout' }, { status: 400 });
    }

    const line_items = items
      .map((item) => {
        if (!item?.id || !item?.quantity || !item?.price) return null;

        const unitAmount = Math.round(Number(item.price) * 100); // dollars → cents
        if (!unitAmount || unitAmount <= 0) return null;

        return {
          quantity: item.quantity,
          price_data: {
            currency: 'usd',
            unit_amount: unitAmount,
            product_data: {
              name: item.name || item.title || 'Product',
            },
          },
        };
      })
      .filter(Boolean);

    if (!line_items.length) {
      return NextResponse.json({ error: 'No valid items found for checkout' }, { status: 400 });
    }

    const taxAmount = Math.round(Number(tax || 0) * 100);
    if (taxAmount > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: taxAmount,
          product_data: { name: 'Sales Tax' },
        },
      });
    }

    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    // Build metadata (keep small — avoid large address blobs)
    const metadata = {
      orderId: orderId || '',
      firstName: contact?.firstName || '',
      lastName: contact?.lastName || '',
      phone: contact?.phone || '',
      // shipping fields (small values ok)
      street: shippingDetails?.street || '',
      line2: shippingDetails?.line2 || '',
      city: shippingDetails?.city || '',
      state: shippingDetails?.state || '',
      zip: shippingDetails?.zip || '',
      country: shippingDetails?.country || '',
      // include a compact cart snapshot (stringified) for email/quick lookup
      cart: JSON.stringify(items ?? []),
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: 'Standard Shipping',
            type: 'fixed_amount',
            fixed_amount: {
              amount: Math.round(Number(shipping || 0) * 100),
              currency: 'usd',
            },
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
      ],
      customer_email: contact?.email || undefined,
      metadata,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });

    // If an orderId is provided, write the user/shipping info server-side to Firestore (merge)
    if (orderId) {
      try {
        const db = initFirebaseAdmin();
        if (db) {
          const orderRef = db.collection('orders').doc(orderId);

          // Build shippingAddress object from shippingDetails/contact
          const shippingAddress = {
            name:
              (contact?.firstName || '') + (contact?.lastName ? ` ${contact.lastName}` : '') ||
              shippingDetails?.name ||
              null,
            line1: shippingDetails?.street || '',
            line2: shippingDetails?.line2 || '',
            city: shippingDetails?.city || '',
            state: shippingDetails?.state || '',
            postalCode: shippingDetails?.zip || '',
            country: shippingDetails?.country || '',
            phone: contact?.phone || null,
          };

          // Build fields to merge
          const toMerge = {
            // keep existing status as-is; only add mapping fields
            userId: userId || null,
            userName: contact?.firstName || contact?.email || null,
            userEmail: contact?.email || null,
            shippingAddress,
            // also store a serverTimestamp of this "pre-checkout" attach
            checkoutSessionCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
            // Persist stripe sessionId reference so webhook matching has another option
            sessionId: session.id,
          };

          // Use set with merge to avoid overriding other fields unintentionally
          await orderRef.set(toMerge, { merge: true });
          console.log('Merged user/shipping info into order', orderId);
        } else {
          console.warn('Skipping Firestore order merge — admin not initialized');
        }
      } catch (err) {
        console.error('Failed to merge user/shipping info into order doc:', err);
      }
    }

    // Return the session id & url
    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
