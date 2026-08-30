'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { scheduleInterviewAction } from "@/app/actions/interviews"
import { createOfferAction } from "@/app/actions/offers"
import { createPreboardingTaskAction, convertToEmployeeAction } from "@/app/actions/preboarding"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ApplicationView({ application, resume, users }: { application: any, resume: any, users: any[] }) {
  const candidate = application.candidates
  const job = application.jobs
  const fitData = application.fit_explanation || {}
  
  const [interviewLoading, setInterviewLoading] = useState(false)
  const [offerLoading, setOfferLoading] = useState(false)
  const [taskLoading, setTaskLoading] = useState(false)
  const [convertLoading, setConvertLoading] = useState(false)
  
  const [isInterviewOpen, setIsInterviewOpen] = useState(false)
  const [isOfferOpen, setIsOfferOpen] = useState(false)
  const [isTaskOpen, setIsTaskOpen] = useState(false)

  const handleScheduleInterview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setInterviewLoading(true)
    const formData = new FormData(e.currentTarget)
    await scheduleInterviewAction(formData, application.id)
    setInterviewLoading(false)
    setIsInterviewOpen(false)
  }

  const handleCreateOffer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setOfferLoading(true)
    const formData = new FormData(e.currentTarget)
    await createOfferAction(formData, application.id)
    setOfferLoading(false)
    setIsOfferOpen(false)
  }

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTaskLoading(true)
    const formData = new FormData(e.currentTarget)
    await createPreboardingTaskAction(formData, application.id)
    setTaskLoading(false)
    setIsTaskOpen(false)
  }

  const handleConvertEmployee = async () => {
    if (!job.organization_id) return
    setConvertLoading(true)
    await convertToEmployeeAction(application.id, candidate.id, job.organization_id)
    setConvertLoading(false)
  }

  const showPreboarding = ['OFFER_ACCEPTED', 'JOINED'].includes(application.stage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-bold tracking-tight">{candidate.full_name}</h2>
            <Badge variant="outline">{application.stage}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Applying for <Link href={`/dashboard/jobs/${job.id}`} className="text-blue-600 hover:underline">{job.title}</Link> 
            &nbsp;• {candidate.current_designation} at {candidate.current_company}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">AI Fit Score</div>
          <div className={`text-2xl font-bold ${application.fit_score > 75 ? 'text-green-600' : application.fit_score > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {application.fit_score ?? 'N/A'}%
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="offer">Offer</TabsTrigger>
          <TabsTrigger value="preboarding" disabled={!showPreboarding}>Preboarding</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Fit Analysis</CardTitle>
                  <CardDescription>Generated based on Resume vs Job Description</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fitData.strengths && (
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {fitData.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {fitData.missing_info && (
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">Missing Information</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {fitData.missing_info.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {fitData.concerns && (
                    <div>
                      <h4 className="font-semibold text-yellow-700 mb-2">Concerns</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {fitData.concerns.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Parsed Resume Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-xs h-[400px] overflow-y-auto font-mono">
                    {resume?.parsed_text || "No resume text available."}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Candidate Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Email</span>
                    {candidate.email}
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Phone</span>
                    {candidate.phone}
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Location</span>
                    {candidate.location}
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Total Experience</span>
                    {candidate.total_experience} Years
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Expected Salary</span>
                    {candidate.expected_salary ? `$${candidate.expected_salary}` : 'N/A'}
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Notice Period</span>
                    {candidate.notice_period ? `${candidate.notice_period} Days` : 'N/A'}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="interviews" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Interviews</CardTitle>
                <CardDescription>Schedule and manage interviews</CardDescription>
              </div>
              <Dialog open={isInterviewOpen} onOpenChange={setIsInterviewOpen}>
                <DialogTrigger render={<Button>Schedule Interview</Button>} />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleScheduleInterview} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Interview Title</Label>
                      <Input id="title" name="title" required placeholder="Technical Round" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduledAt">Date & Time</Label>
                      <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input id="duration" name="duration" type="number" defaultValue="60" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
                      <Input id="meetingLink" name="meetingLink" type="url" placeholder="https://zoom.us/..." />
                    </div>
                    <Button type="submit" className="w-full" disabled={interviewLoading}>
                      {interviewLoading ? "Scheduling..." : "Schedule"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {application.interviews?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No interviews scheduled yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {application.interviews?.map((interview: any) => (
                    <div key={interview.id} className="border p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{interview.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(interview.scheduled_at).toLocaleString()} ({interview.duration_minutes} min)
                        </div>
                      </div>
                      <Badge variant={interview.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {interview.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offer" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Offer Details</CardTitle>
                <CardDescription>Manage compensation and offer status</CardDescription>
              </div>
              <Dialog open={isOfferOpen} onOpenChange={setIsOfferOpen}>
                <DialogTrigger render={<Button>Create Offer</Button>} />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Offer</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateOffer} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="baseSalary">Base Salary</Label>
                        <Input id="baseSalary" name="baseSalary" type="number" required placeholder="100000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Input id="currency" name="currency" defaultValue="USD" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="equityDetails">Equity / Bonus (Optional)</Label>
                      <Input id="equityDetails" name="equityDetails" placeholder="10,000 RSUs" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Target Start Date</Label>
                      <Input id="startDate" name="startDate" type="date" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={offerLoading}>
                      {offerLoading ? "Creating..." : "Create Offer"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {application.offers?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No offers generated yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {application.offers?.map((offer: any) => (
                    <div key={offer.id} className="border p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-semibold">Base Salary: {offer.base_salary} {offer.currency}</div>
                        <div className="text-sm text-muted-foreground">Start Date: {offer.start_date || 'N/A'}</div>
                      </div>
                      <Badge variant="outline">{offer.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preboarding" className="mt-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Onboarding Tasks</CardTitle>
                    <CardDescription>Track tasks for {candidate.full_name} joining</CardDescription>
                  </div>
                  <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
                    <DialogTrigger render={<Button variant="outline">Add Task</Button>} />
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Onboarding Task</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Task Title</Label>
                          <Input id="title" name="title" required placeholder="e.g. Sign NDA" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Assign To</Label>
                          <Select name="type" defaultValue="CANDIDATE">
                            <SelectTrigger>
                              <SelectValue placeholder="Select assignee" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CANDIDATE">Candidate</SelectItem>
                              <SelectItem value="INTERNAL">Internal Team</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input id="dueDate" name="dueDate" type="date" />
                        </div>
                        <Button type="submit" className="w-full" disabled={taskLoading}>
                          {taskLoading ? "Adding..." : "Add Task"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {application.onboarding_tasks?.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      No onboarding tasks added yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {application.onboarding_tasks?.map((task: any) => (
                        <div key={task.id} className="flex items-center space-x-3 border p-3 rounded-md">
                          <Checkbox checked={task.status === 'COMPLETED'} />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{task.title}</div>
                            <div className="text-xs text-muted-foreground">
                              Assigned to: {task.type} • Due: {task.due_date || 'No Date'}
                            </div>
                          </div>
                          <Badge variant="outline">{task.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {application.candidate_documents?.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-xs">
                      No documents collected.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {application.candidate_documents?.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between border-b pb-2">
                          <div className="text-sm font-medium">{doc.document_type}</div>
                          <Badge variant="secondary" className="text-[10px]">{doc.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Final Conversion</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Convert this candidate to a registered Employee after all tasks and documents are verified.
                  </p>
                  <Button 
                    className="w-full" 
                    variant={application.stage === 'JOINED' ? 'secondary' : 'default'}
                    disabled={application.stage === 'JOINED' || convertLoading}
                    onClick={handleConvertEmployee}
                  >
                    {convertLoading ? "Converting..." : application.stage === 'JOINED' ? "Already Converted" : "Convert to Employee"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
