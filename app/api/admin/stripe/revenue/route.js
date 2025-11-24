import { stripe } from '@/app/lib/stripe';

// Helpful request-level logging to debug local dev connectivity
console.log('Loaded /api/admin/stripe/revenue route. Stripe configured:', !!stripe);

function formatKeyFromDate(d, period) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (period === 'month') return `${year}-${month}`;
  return `${year}-${month}-${day}`;
}

export async function GET(req) {
  console.log('[stripe/revenue] GET handler invoked');
  try {
    if (!stripe) {
      console.warn('[stripe/revenue] Stripe is not configured (missing secret key)');
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 500 });
    }

    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'day';
    const days = Number(url.searchParams.get('days') || '90');

    console.log(`[stripe/revenue] params period=${period} days=${days}`);

    const since = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);

    // Collect payment intents since `since`. Use auto-pagination to be safe.
    const listParams = { created: { gte: since } };

    // autoPagingToArray returns an array of results (limit protects runaway requests)
  const payments = await stripe.paymentIntents.list(listParams).autoPagingToArray({ limit: 2000 });

  console.log('[stripe/revenue] fetched', payments.length, 'payment intents');

    // Sum amount_received for successful payment intents and group by period
    let totalCents = 0;
    const map = new Map();

    for (const p of payments) {
      // consider only succeeded or requires_capture (capturable)
      if (!(p.status === 'succeeded' || p.status === 'requires_capture')) continue;

      const cents = Number(p.amount_received ?? p.amount ?? 0) || 0;
      totalCents += cents;

      const dt = new Date((p.created || 0) * 1000);
      if (isNaN(dt.getTime())) continue;
      const key = formatKeyFromDate(dt, period);
      map.set(key, (map.get(key) || 0) + cents);
    }

    // convert map to sorted array (desc by key)
    const revenueByPeriod = Array.from(map.entries())
      .map(([k, v]) => [k, Number((v / 100).toFixed(2))])
      .sort((a, b) => (a[0] < b[0] ? 1 : -1));

    const result = {
      totalRevenue: Number((totalCents / 100).toFixed(2)),
      revenueByPeriod,
      count: payments.length,
    };

    console.log('[stripe/revenue] returning result totalRevenue=', result.totalRevenue, 'groups=', result.revenueByPeriod.length);
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Stripe revenue API error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
