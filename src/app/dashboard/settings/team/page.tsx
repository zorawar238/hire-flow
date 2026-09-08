"use client"

import { useState } from "react"
import { inviteTeamMember } from "@/app/actions/organization"
import { Users, Mail, Shield, MoreVertical } from "lucide-react"

export default function TeamSettingsPage() {
  const [isInviting, setIsInviting] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsInviting(true)
    const formData = new FormData(e.currentTarget)
    
    // In a real app, we would get the orgId from the current user's session
    const orgId = "00000000-0000-0000-0000-000000000000" // Placeholder
    
    await inviteTeamMember(orgId, {
      email: formData.get("email"),
      role: formData.get("role"),
    })
    setIsInviting(false)
    setShowInviteModal(false)
  }

  // Mock data for MVP UI
  const teamMembers = [
    { id: 1, name: "John Smith", email: "john@hireflow.ai", role: "SUPER_ADMIN", status: "ACTIVE" },
    { id: 2, name: "Sarah Connor", email: "sarah@hireflow.ai", role: "RECRUITER", status: "ACTIVE" },
  ]
  const pendingInvites = [
    { id: 1, email: "newguy@hireflow.ai", role: "HIRING_MANAGER", sentAt: "2 days ago" }
  ]

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
          <p className="text-sm text-slate-500 mt-1">Manage who has access to your organization.</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-medium text-slate-900 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            Active Members ({teamMembers.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {teamMembers.map(member => (
            <div key={member.id} className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {member.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{member.name}</div>
                  <div className="text-sm text-slate-500">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  <Shield className="w-3 h-3" />
                  {member.role.replace('_', ' ')}
                </span>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {pendingInvites.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-medium text-slate-900 text-sm">Pending Invitations ({pendingInvites.length})</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingInvites.map(invite => (
              <div key={invite.id} className="flex items-center justify-between p-6">
                <div>
                  <div className="font-medium text-slate-900">{invite.email}</div>
                  <div className="text-sm text-slate-500">Sent {invite.sentAt}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    {invite.role.replace('_', ' ')}
                  </span>
                  <button className="text-sm text-red-600 font-medium hover:text-red-700">Revoke</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Invite Team Member</h3>
              <p className="text-sm text-slate-500 mt-1">Send an invitation to join your organization.</p>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <input 
                  name="email" 
                  type="email" 
                  placeholder="colleague@example.com"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role</label>
                <select 
                  name="role"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="RECRUITER">Recruiter</option>
                  <option value="HIRING_MANAGER">Hiring Manager</option>
                  <option value="INTERVIEWER">Interviewer</option>
                  <option value="FINANCE_APPROVER">Finance Approver</option>
                  <option value="HR_HEAD">HR Head</option>
                  <option value="ORG_ADMIN">Organization Admin</option>
                </select>
                <p className="text-xs text-slate-500">Recruiters can create jobs and manage candidates. Organization Admins have full access to settings.</p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isInviting}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-70"
                >
                  {isInviting ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
