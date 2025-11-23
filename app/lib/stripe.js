// app/lib/stripe.js
import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.error('❌ STRIPE_SECRET_KEY is missing in environment variables');
}

// Export *either* a Stripe instance or null
export const stripe =
  secretKey
    ? new Stripe(secretKey, { apiVersion: '2024-06-20' })
    : null;

export default stripe;
