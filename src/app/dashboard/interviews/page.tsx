import { getInterviewsAction } from "@/app/actions/interviews"
import { Calendar, Video, Clock, User, Briefcase, CheckCircle2, XCircle, AlertCircle, Link as LinkIcon } from "lucide-react"
import Link from "next/link"

export default async function InterviewsPage() {
  const result = await getInterviewsAction()
  
  if (result.error || !result.success) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-xl font-semibold mb-2">Could not load interviews</h2>
        <p>{result.error || "Unknown error occurred"}</p>
      </div>
    )
  }

  const interviews = result.data || []
  
  const now = new Date()
  
  const upcoming = interviews.filter((i: any) => new Date(i.scheduledAt) >= now && i.status === 'SCHEDULED')
  const past = interviews.filter((i: any) => new Date(i.scheduledAt) < now || i.status !== 'SCHEDULED')

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'SCHEDULED': return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1"><Clock className="w-3 h-3"/> Scheduled</span>
      case 'COMPLETED': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Completed</span>
      case 'CANCELLED': return <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full flex items-center gap-1"><XCircle className="w-3 h-3"/> Cancelled</span>
      case 'NO_SHOW': return <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3"/> No Show</span>
      default: return null
    }
  }

  const renderInterviewCard = (interview: any) => {
    const date = new Date(interview.scheduledAt)
    return (
      <div key={interview.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-700 flex-shrink-0">
              <span className="text-xs font-bold uppercase">{date.toLocaleString('default', { month: 'short' })}</span>
              <span className="text-xl font-black leading-none">{date.getDate()}</span>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-slate-900">{interview.title}</h3>
                {getStatusBadge(interview.status)}
              </div>
              
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex items-center text-sm text-slate-600 gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-900">{interview.candidateName}</span> 
                  <span className="text-slate-400">•</span>
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>{interview.jobTitle}</span>
                </div>
                
                <div className="flex items-center text-sm text-slate-600 gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({interview.duration} min)</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">Interviewer: <span className="font-medium text-slate-700">{interview.interviewerName}</span></span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {interview.meetingLink && interview.status === 'SCHEDULED' && (
              <a 
                href={interview.meetingLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
              >
                <Video className="w-4 h-4" />
                Join Meeting
              </a>
            )}
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Interviews</h2>
          <p className="text-slate-500 mt-1">Manage your upcoming and past candidate interviews.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Upcoming Interviews
          </h3>
          {upcoming.length > 0 ? (
            <div className="space-y-4">
              {upcoming.map(renderInterviewCard)}
            </div>
          ) : (
            <div className="p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center">
              <p className="text-slate-500 font-medium">No upcoming interviews scheduled.</p>
            </div>
          )}
        </div>

        <div className="pt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-slate-400" />
            Past & Completed
          </h3>
          {past.length > 0 ? (
            <div className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
              {past.map(renderInterviewCard)}
            </div>
          ) : (
            <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center">
              <p className="text-slate-400 font-medium">No past interviews found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
