export default function CancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="max-w-md bg-white rounded-2xl shadow p-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Payment canceled ❌</h1>
        <p className="text-gray-600 mb-4">
          Your payment was not completed. You can review your cart and try again.
        </p>
        <a
          href="/checkout"
          className="inline-block mt-2 px-4 py-2 rounded-xl bg-black text-white text-sm"
        >
          Back to Checkout
        </a>
      </div>
    </main>
  );
}
