import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-800">
          HireFlow AI
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-800">
            Overview
          </Link>
          <Link href="/dashboard/jobs" className="block px-4 py-2 rounded hover:bg-gray-800">
            Jobs
          </Link>
          <Link href="/dashboard/candidates" className="block px-4 py-2 rounded hover:bg-gray-800">
            Candidates
          </Link>
          <Link href="/dashboard/interviews" className="block px-4 py-2 rounded hover:bg-gray-800">
            Interviews
          </Link>
          <Link href="/dashboard/employees" className="block px-4 py-2 rounded hover:bg-gray-800">
            Employees
          </Link>
          <Link href="/dashboard/settings" className="block px-4 py-2 rounded hover:bg-gray-800">
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="text-sm">Logged in as</div>
          <div className="font-medium truncate">john@example.com</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center px-6 justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Workspace</h1>
          <div>
            <button className="text-gray-500 hover:text-gray-700">Logout</button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
