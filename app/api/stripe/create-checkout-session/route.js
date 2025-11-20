// app/api/stripe/create-checkout-session/route.ts (or .js)
import { NextResponse } from 'next/server';
import stripe from '@/app/lib/stripe';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.json();
    const { items, shipping, tax } = body; // [{ id, name, price, quantity }, ...]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items to checkout' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'No valid items found for checkout' },
        { status: 400 }
      );
    }
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

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      // 🔥 ask Stripe Checkout to collect address (optional but usually desired)
      shipping_address_collection: {
        allowed_countries: ['US'], // adjust as needed
      },
      // 🔥 define a shipping option using the amount from frontend
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: 'Standard Shipping',
            type: 'fixed_amount',
            fixed_amount: {
              amount: Math.round(Number(shipping) * 100), // dollars -> cents
              currency: 'usd',
            },
            // optional: estimated delivery
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });

    // 🔴 OLD: return only id
    // return NextResponse.json({ id: session.id });

    // ✅ NEW: return url (and id if you still want)
    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
