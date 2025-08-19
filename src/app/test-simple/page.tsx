export default function TestSimple() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Simple Test Page</h1>
      <p>If you can see this, the routing is working!</p>
      <div className="mt-4">
        <a href="/documents" className="text-blue-600 hover:underline">Go to Documents</a>
      </div>
    </div>
  )
}