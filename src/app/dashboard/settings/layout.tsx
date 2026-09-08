import Link from "next/link"
import { ReactNode } from "react"
import { Building2, Users, Network } from "lucide-react"

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your company details, team members, and departments.</p>
        
        <div className="flex gap-6 mt-6 border-b border-slate-100">
          <Link href="/dashboard/settings" className="flex items-center gap-2 pb-3 border-b-2 border-indigo-600 text-indigo-700 font-medium text-sm">
            <Building2 className="w-4 h-4" />
            General
          </Link>
          <Link href="/dashboard/settings/team" className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors">
            <Users className="w-4 h-4" />
            Team
          </Link>
          <Link href="/dashboard/settings/departments" className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors">
            <Network className="w-4 h-4" />
            Departments
          </Link>
        </div>
      </div>
      
      <div className="flex-1 p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
