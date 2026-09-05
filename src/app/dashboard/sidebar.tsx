"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Briefcase, Users, Calendar, Settings, LogOut, FileText } from "lucide-react"

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Candidates", href: "/dashboard/candidates", icon: Users },
  { name: "Interviews", href: "/dashboard/interviews", icon: Calendar },
  { name: "Employees", href: "/dashboard/employees", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-[#0A0F1C] text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Subtle top gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
      
      <div className="p-6 pt-8 text-2xl font-black text-white flex items-center gap-3 tracking-tight z-10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="text-sm">HF</span>
        </div>
        HireFlow AI
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 z-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                ${isActive 
                  ? "bg-white/10 text-white font-medium shadow-sm" 
                  : "hover:bg-white/5 hover:text-white"
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              )}
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-300"}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-6 border-t border-white/5 z-10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-slate-900 font-bold shadow-inner flex-shrink-0">
            JS
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-semibold text-white truncate">John Smith</div>
            <div className="text-xs text-slate-400 truncate">john@hireflow.ai</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
