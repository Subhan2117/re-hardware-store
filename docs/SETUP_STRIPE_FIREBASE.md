# Setup Stripe Webhook and Firebase Admin (Local)

Follow these steps to enable server-side webhook processing and let the webhook update Firestore orders to `Paid`.

## 1) Add Stripe webhook secret

1. Open your Stripe Dashboard → Developers → Webhooks.
2. Create a new webhook endpoint with the URL pointed at your local dev server (when using stripe CLI) or production URL. For local development you can use the Stripe CLI to forward events:

   ```bash
   # Install stripe CLI if you don't have it
   # https://stripe.com/docs/stripe-cli
   stripe login
   # Forward webhooks to your local dev server
   stripe listen --forward-to http://localhost:3001/api/stripe/webhook
   ```

3. The CLI will print a webhook signing secret like `whsec_...`. Copy that value and put it into your `.env.local` as `STRIPE_WEBHOOK_SECRET=whsec_...`.

## 2) Provide Firebase Admin credentials

The webhook runs server-side and uses the Firebase Admin SDK to update Firestore. You must provide credentials so the server can authenticate.

- Preferred (development):
  1. In the Firebase Console, create a service account and download the JSON key file (Service account -> Create new private key).
  2. Save the file in your project root as `service-account.json` (or somewhere secure).
  3. Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the path of that file. We already added a placeholder in `.env.local`:

     ```bash
     GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
     ```

  4. Restart your Next dev server so the Admin SDK picks up the credentials.

- Alternative (production): Use your hosting provider's secret manager to provide credentials or set up the proper service account in the hosted environment.

## 3) Restart dev server

After updating `.env.local` (or exporting env vars in your terminal), restart Next so the webhook route and Admin SDK see the updated env:

```bash
npm run dev
```

Watch the terminal for the webhook route load log (we added a small console log):

```
Loaded /api/admin/stripe/revenue route. Stripe configured: true
# and when webhook code loads you should see 'Initialized Firebase Admin SDK' when admin initializes
```

## 4) Test webhooks locally (recommended using Stripe CLI)

1. In one terminal, start the Next dev server:

```bash
npm run dev
```

2. In another terminal, forward events with the Stripe CLI and run a test event:

```bash
stripe listen --forward-to http://localhost:3001/api/stripe/webhook
# Then in another terminal run
stripe trigger checkout.session.completed
```

3. Watch the Next terminal for logs from the webhook route. It should log `Received Stripe event: checkout.session.completed` and then show whether it found an order and updated it to `Paid`.

## 5) Security and cleanup

- Do NOT commit `.env.local` or `service-account.json` into source control. The repository `.gitignore` already ignores `.env*` but you may want to add `service-account.json` explicitly.
- For production, set environment variables via your host (Vercel, Render, etc.) and add webhook endpoint URL in the Stripe dashboard.

## Troubleshooting

- If the webhook fails signature verification, ensure `STRIPE_WEBHOOK_SECRET` exactly matches the secret provided by Stripe (no extra whitespace/newlines).
- If Admin SDK fails to initialize, confirm `GOOGLE_APPLICATION_CREDENTIALS` points to a valid service account JSON and that the environment has permissions.
- If Stripe events are not received locally, use the `stripe listen` command while your dev server is reachable on the forwarded URL.

If you want, I can also:
- Add an automated test script that runs `stripe trigger` commands and checks Firestore for updates.
- Update the checkout flow to set the Firestore doc id as the orderId and pass it into Stripe session metadata to make matching exact.
