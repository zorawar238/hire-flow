import { Briefcase, Users, Calendar, TrendingUp, ChevronRight, Activity, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { getDashboardStatsAction } from "@/app/actions/dashboard"

export default async function DashboardOverview() {
  const result = await getDashboardStatsAction()
  
  if (result.error || !result.success || !result.data) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-xl font-semibold mb-2">Could not load dashboard data</h2>
        <p>{result.error || "Unknown error occurred"}</p>
      </div>
    )
  }

  const { data } = result
  
  const stats = [
    { 
      title: "Total Open Jobs", 
      value: data.openJobs.toString(), 
      change: "Active right now", 
      trend: "neutral",
      icon: Briefcase,
      color: "from-blue-500 to-cyan-400"
    },
    { 
      title: "New Applicants", 
      value: data.newApplicants.toString(), 
      change: "In the last 7 days", 
      trend: "up",
      icon: Users,
      color: "from-indigo-500 to-purple-500"
    },
    { 
      title: "Interviews", 
      value: data.scheduledInterviews.toString(), 
      change: "Scheduled", 
      trend: "neutral",
      icon: Calendar,
      color: "from-amber-400 to-orange-500"
    },
    { 
      title: "Offers Sent", 
      value: data.offersSent.toString(), 
      change: "Active offers", 
      trend: "neutral",
      icon: TrendingUp,
      color: "from-emerald-400 to-teal-500"
    },
  ]

  const { pipeline, recentActivity } = data
  const totalApps = pipeline.total || 1 // Avoid division by zero
  const getPercent = (val: number) => Math.round((val / totalApps) * 100) || 0

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Good morning!</h2>
          <p className="text-slate-500 mt-1">Here is what is happening with your hiring pipeline today.</p>
        </div>
        <Link 
          href="/dashboard/jobs/new" 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all bg-slate-900 rounded-full hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-95"
        >
          <Briefcase className="w-4 h-4" />
          Create New Job
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div 
            key={stat.title}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
          >
            {/* Background decorative gradient */}
            <div className={`absolute -right-12 -top-12 w-32 h-32 opacity-10 bg-gradient-to-br ${stat.color} rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
            
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-0.5 shadow-sm`}>
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{ color: 'transparent' }} />
                  <div className="absolute inset-0 flex items-center justify-center mix-blend-multiply">
                     <stat.icon className="w-5 h-5 text-slate-700" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
            
            <div className="mt-4 flex items-center text-sm">
              {stat.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />}
              <span className={stat.trend === 'up' ? "text-emerald-600 font-medium" : "text-slate-500"}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Hiring Pipeline Overview
            </h3>
            <Link href="/dashboard/candidates" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View All</Link>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div className="relative pt-2">
              <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                <span>Applied ({pipeline.applied})</span>
                <span>{getPercent(pipeline.applied)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full bg-slate-300 rounded-full`} style={{ width: `${getPercent(pipeline.applied)}%` }}></div>
              </div>
            </div>
            
            <div className="relative pt-2">
              <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                <span>Screening ({pipeline.screening})</span>
                <span>{getPercent(pipeline.screening)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]`} style={{ width: `${getPercent(pipeline.screening)}%` }}></div>
              </div>
            </div>

            <div className="relative pt-2">
              <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                <span>Interview ({pipeline.interview})</span>
                <span>{getPercent(pipeline.interview)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]`} style={{ width: `${getPercent(pipeline.interview)}%` }}></div>
              </div>
            </div>

            <div className="relative pt-2">
              <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                <span>Offer ({pipeline.offer})</span>
                <span>{getPercent(pipeline.offer)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]`} style={{ width: `${getPercent(pipeline.offer)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          </div>
          
          <div className="space-y-6">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity: any, index: number) => (
                <div key={activity.id} className="flex gap-4 relative">
                  {index !== recentActivity.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-slate-100" />
                  )}
                  <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm z-10">
                    {activity.avatar}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm text-slate-900">
                      <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-medium text-indigo-600">{activity.target}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                  <Activity className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-900">No recent activity</p>
                <p className="text-xs text-slate-500 mt-1">When candidates apply or move stages, it will show up here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
