'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { createGoalAction, updateGoalProgressAction, submitReviewAction, addFeedbackAction, saveMeetingNoteAction, saveCareerPathAction } from "@/app/actions/performance"

export default function PerformanceView({ employee, currentUser }: { employee: any, currentUser?: any }) {
  const goals = employee.performance_goals || []
  const reviews = employee.performance_reviews || []
  const feedback = employee.employee_feedback || []
  const meetingNotes = employee.meeting_notes || []
  const careerPaths = employee.career_paths || []
  const activeCareerPath = careerPaths[careerPaths.length - 1]

  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState<string | null>(null)
  
  // State for Review Form
  const [reviewRating, setReviewRating] = useState(3)

  const handleCreateGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    await createGoalAction(new FormData(e.currentTarget), employee.id)
    setLoading(false)
    setOpenDialog(null)
  }

  const handleUpdateProgress = async (goalId: string, progressStr: string) => {
    const progress = parseInt(progressStr, 10)
    await updateGoalProgressAction(goalId, progress, employee.id)
  }

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('rating', reviewRating.toString())
    // Hardcoded reviewer_id for demo if currentUser is undefined
    await submitReviewAction(formData, employee.id, currentUser?.id || employee.id) 
    setLoading(false)
    setOpenDialog(null)
  }

  const handleAddFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    await addFeedbackAction(new FormData(e.currentTarget), employee.id, currentUser?.id || employee.id)
    setLoading(false)
    setOpenDialog(null)
  }

  const handleSaveMeetingNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    await saveMeetingNoteAction(new FormData(e.currentTarget), employee.id, currentUser?.id || employee.id)
    setLoading(false)
    setOpenDialog(null)
  }

  const handleSaveCareerPath = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    await saveCareerPathAction(new FormData(e.currentTarget), employee.id)
    setLoading(false)
    setOpenDialog(null)
  }

  return (
    <div className="grid grid-cols-2 gap-6 mt-4">
      <div className="space-y-6">
        {/* GOALS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Goals & OKRs</CardTitle>
              <CardDescription>Track performance objectives</CardDescription>
            </div>
            <Dialog open={openDialog === 'goal'} onOpenChange={(open) => setOpenDialog(open ? 'goal' : null)}>
              <DialogTrigger render={<Button variant="outline" size="sm">Add Goal</Button>} />
              <DialogContent>
                <DialogHeader><DialogTitle>New Goal</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateGoal} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" name="dueDate" type="date" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>Save Goal</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.length === 0 ? <p className="text-sm text-muted-foreground">No goals set.</p> : goals.map((goal: any) => (
              <div key={goal.id} className="border p-4 rounded-md space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{goal.title}</div>
                    <div className="text-xs text-muted-foreground">{goal.description}</div>
                  </div>
                  <Badge variant={goal.status === 'COMPLETED' ? 'default' : 'secondary'}>{goal.status}</Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-medium w-12">{goal.progress}%</span>
                  <Slider 
                    defaultValue={[goal.progress]} 
                    max={100} step={10} 
                    onValueCommitted={(val: number | readonly number[]) => handleUpdateProgress(goal.id, Array.isArray(val) ? val[0].toString() : val.toString())}
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* FEEDBACK */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Continuous Feedback</CardTitle>
            </div>
            <Dialog open={openDialog === 'feedback'} onOpenChange={(open) => setOpenDialog(open ? 'feedback' : null)}>
              <DialogTrigger render={<Button variant="outline" size="sm">Add Feedback</Button>} />
              <DialogContent>
                <DialogHeader><DialogTitle>Add Feedback</DialogTitle></DialogHeader>
                <form onSubmit={handleAddFeedback} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Feedback Type</Label>
                    <Select name="type" defaultValue="CONTINUOUS">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONTINUOUS">Continuous Feedback</SelectItem>
                        <SelectItem value="360_REVIEW">360 Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea id="content" name="content" required placeholder="Great job on..." />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>Submit Feedback</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedback.length === 0 ? <p className="text-sm text-muted-foreground">No feedback recorded.</p> : feedback.map((fb: any) => (
              <div key={fb.id} className="border-l-4 border-l-blue-500 pl-4 py-2 text-sm bg-muted/30 rounded-r-md">
                <div className="font-medium mb-1 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] uppercase">{fb.type}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(fb.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-muted-foreground">{fb.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* REVIEWS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Performance Reviews</CardTitle>
            </div>
            <Dialog open={openDialog === 'review'} onOpenChange={(open) => setOpenDialog(open ? 'review' : null)}>
              <DialogTrigger render={<Button variant="outline" size="sm">New Review</Button>} />
              <DialogContent>
                <DialogHeader><DialogTitle>Submit Review</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cycleName">Review Cycle</Label>
                    <Input id="cycleName" name="cycleName" placeholder="e.g. Q3 2026" required />
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label className="flex justify-between">
                      <span>Rating (1-5)</span>
                      <span className="font-bold">{reviewRating} / 5</span>
                    </Label>
                    <Slider 
                      value={[reviewRating]} 
                      onValueChange={(val: number | readonly number[]) => setReviewRating(Array.isArray(val) ? val[0] : val as number)} 
                      min={1} max={5} step={1} 
                    />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="comments">Manager Comments</Label>
                    <Textarea id="comments" name="comments" rows={4} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>Submit Review</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviews.length === 0 ? <p className="text-sm text-muted-foreground">No formal reviews submitted.</p> : reviews.map((rev: any) => (
              <div key={rev.id} className="flex flex-col border p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">{rev.cycle_name}</div>
                  <div className="flex items-center space-x-1">
                    {[1,2,3,4,5].map(star => (
                      <span key={star} className={`text-lg ${star <= rev.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{rev.comments}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 1-on-1s */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>1-on-1 Notes</CardTitle>
            </div>
            <Dialog open={openDialog === '1on1'} onOpenChange={(open) => setOpenDialog(open ? '1on1' : null)}>
              <DialogTrigger render={<Button variant="outline" size="sm">Log Meeting</Button>} />
              <DialogContent>
                <DialogHeader><DialogTitle>Log 1-on-1</DialogTitle></DialogHeader>
                <form onSubmit={handleSaveMeetingNote} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meetingDate">Date</Label>
                    <Input id="meetingDate" name="meetingDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Discussion Notes</Label>
                    <Textarea id="notes" name="notes" rows={5} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>Save Notes</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
            {meetingNotes.length === 0 ? <p className="text-sm text-muted-foreground">No meetings logged.</p> : meetingNotes.map((note: any) => (
              <div key={note.id} className="border p-3 rounded-md bg-muted/10 text-sm">
                <div className="font-semibold mb-2">{new Date(note.meeting_date).toLocaleDateString()}</div>
                <div className="text-muted-foreground whitespace-pre-wrap">{note.notes}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
