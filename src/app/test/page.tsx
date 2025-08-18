export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Risk Documentation Hub - Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Application Status</h2>
          <p className="text-green-600">✅ Application is deployed and accessible</p>
          <p className="mt-2">If you can see this page, the Next.js application is working correctly.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Links</h2>
          <div className="space-y-2">
            <p><a href="/auth/signin" className="text-blue-600 hover:underline">Sign In Page (relative)</a></p>
            <p><a href="/ragdocumenthub/auth/signin" className="text-blue-600 hover:underline">Sign In Page (with basePath)</a></p>
            <p><a href="/api/auth/providers" className="text-blue-600 hover:underline">Auth Providers API</a></p>
            <p><a href="/" className="text-blue-600 hover:underline">Home Page</a></p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting 404 Errors</h2>
          <p className="mb-4">If you're getting 404 errors after login, the most likely cause is that the database hasn't been initialized with user data.</p>
          
          <h3 className="font-semibold mt-4 mb-2">To fix this:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to your Supabase dashboard</li>
            <li>Open the SQL Editor</li>
            <li>Run the init-database.sql script first</li>
            <li>Run the seed-database.sql script to add test users</li>
            <li>Try logging in again with:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Email: admin@example.com</li>
                <li>Password: Admin123!</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}