import { Sidebar } from "./sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-8 justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Workspace</h1>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Help
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <button className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
