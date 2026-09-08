"use client"

import { useState } from "react"
import { createDepartment } from "@/app/actions/organization"
import { Network, Plus, MoreVertical, FolderTree } from "lucide-react"

export default function DepartmentsPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsCreating(true)
    const formData = new FormData(e.currentTarget)
    
    // In a real app, we would get the orgId from the current user's session
    const orgId = "00000000-0000-0000-0000-000000000000" // Placeholder
    
    await createDepartment(orgId, {
      name: formData.get("name"),
      head_id: formData.get("head_id"),
    })
    setIsCreating(false)
    setShowCreateModal(false)
  }

  // Mock data for MVP UI
  const departments = [
    { id: 1, name: "Engineering", head: "John Smith", employees: 12, jobs: 3 },
    { id: 2, name: "Design", head: "Sarah Connor", employees: 4, jobs: 1 },
    { id: 3, name: "Marketing", head: "None", employees: 5, jobs: 0 },
  ]
  
  const teamMembers = [
    { id: "uuid-1", name: "John Smith" },
    { id: "uuid-2", name: "Sarah Connor" },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Departments</h2>
          <p className="text-sm text-slate-500 mt-1">Organize your company structure and associate jobs.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => (
          <div key={dept.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FolderTree className="w-5 h-5" />
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <h3 className="mt-4 font-bold text-slate-900 text-lg">{dept.name}</h3>
              <div className="mt-2 space-y-1">
                <div className="text-sm text-slate-500">
                  <span className="font-medium text-slate-700">Head:</span> {dept.head}
                </div>
                <div className="text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{dept.employees}</span> Employees
                </div>
                <div className="text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{dept.jobs}</span> Open Jobs
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Create Department</h3>
              <p className="text-sm text-slate-500 mt-1">Add a new department to your organization structure.</p>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Department Name</label>
                <input 
                  name="name" 
                  type="text" 
                  placeholder="e.g. Sales"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Department Head (Optional)</label>
                <select 
                  name="head_id"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="">-- Unassigned --</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-70"
                >
                  {isCreating ? "Creating..." : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
