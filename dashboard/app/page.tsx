export default function Page() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Compliance & Security Scanner Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow border">
          <h2 className="font-semibold mb-2">Compliance Score</h2>
          <p className="text-2xl font-bold">—%</p>
          <p className="text-xs text-gray-500">No data yet</p>
        </div>
        <div className="bg-white p-4 rounded shadow border">
          <h2 className="font-semibold mb-2">Rules</h2>
          <p className="text-2xl font-bold">—</p>
          <p className="text-xs text-gray-500">No data yet</p>
        </div>
        <div className="bg-white p-4 rounded shadow border">
          <h2 className="font-semibold mb-2">Vulnerabilities</h2>
          <p className="text-2xl font-bold">—</p>
          <p className="text-xs text-gray-500">No data yet</p>
        </div>
      </div>
    </main>
  );
}
