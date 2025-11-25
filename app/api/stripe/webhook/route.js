// This route has been intentionally minimized because the real webhook endpoint
// is exposed at `/stripe/webhook`. To avoid maintaining duplicate logic we
// redirect incoming requests here to the canonical endpoint.

export async function POST() {
  return new Response(null, { status: 301, headers: { Location: '/stripe/webhook' } });
}

export async function GET() {
  return new Response(null, { status: 301, headers: { Location: '/stripe/webhook' } });
}
