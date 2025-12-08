// app/api/stripe/create-checkout-session/route.js
import { NextResponse } from 'next/server';
import stripe from '@/app/lib/stripe';

export const runtime = 'nodejs';

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
    const { items, shipping, tax, contact, shippingDetails, orderId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items to checkout' },
        { status: 400 }
      );
    }

    // Build Stripe line_items for checkout
    const line_items = items
      .map((item) => {
        if (!item?.id || !item?.quantity || !item?.price) return null;

        const unitAmount = Math.round(Number(item.price) * 100); // dollars → cents
        if (!unitAmount || unitAmount <= 0) return null;

        return {
          quantity: Number(item.quantity),
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
      return NextResponse.json(
        { error: 'No valid items found for checkout' },
        { status: 400 }
      );
    }

    // Extra tax line item (so Stripe total matches what you show)
    const taxAmount = Math.round(Number(tax || 0) * 100);
    if (taxAmount > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: taxAmount,
          product_data: {
            name: 'Sales Tax',
          },
        },
      });
    }

    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    // 🔥 This is what the webhook will use to decrement stock
    // We send the Firestore product doc id as `productId`
    const cartForMetadata = items.map((item) => ({
      productId: item.id, // this should be Firestore products doc.id
      name: item.name || item.title || 'Product',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
    }));

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
              amount: Math.round(Number(shipping || 0) * 100), // dollars -> cents
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

      // Attach metadata so webhook can rebuild the order + decrement stock
      metadata: {
        orderId: orderId || '', // Firestore order doc id (if you created one earlier)
        firstName: contact?.firstName || '',
        lastName: contact?.lastName || '',
        phone: contact?.phone || '',
        street: shippingDetails?.street || '',
        city: shippingDetails?.city || '',
        state: shippingDetails?.state || '',
        zip: shippingDetails?.zip || '',

        // 🔑 THIS is now the cleaned cart with productId
        cart: JSON.stringify(cartForMetadata),

        // Totals for email / order summaries
        tax: tax != null ? String(tax) : '0',
        shipping: shipping != null ? String(shipping) : '0',
      },

      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
