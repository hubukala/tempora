export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-white">
          ⏱️ Tempora
        </h1>
        <p className="mb-8 text-lg text-gray-400">
          Freelancer project management — time tracking, kanban, invoicing.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/dashboard"
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Go to Dashboard
          </a>
          <a
            href="/api/health"
            className="rounded-lg border border-gray-700 px-6 py-3 text-sm font-semibold text-gray-300 transition hover:border-gray-500"
          >
            API Health →
          </a>
        </div>
      </div>
    </main>
  );
}
