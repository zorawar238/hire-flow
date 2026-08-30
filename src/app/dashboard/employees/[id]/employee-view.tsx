'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { initiateSeparationAction, createOffboardingTaskAction, finalizeSeparationAction } from "@/app/actions/separations"
import PerformanceView from "./performance-view"

export default function EmployeeView({ employee }: { employee: any }) {
  const candidate = employee.candidates
  const separations = employee.separations || []
  const activeSeparation = separations.find((s: any) => s.status !== 'COMPLETED')
  
  const [initiateLoading, setInitiateLoading] = useState(false)
  const [taskLoading, setTaskLoading] = useState(false)
  const [finalizeLoading, setFinalizeLoading] = useState(false)
  
  const [isInitiateOpen, setIsInitiateOpen] = useState(false)
  const [isTaskOpen, setIsTaskOpen] = useState(false)

  const handleInitiateSeparation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setInitiateLoading(true)
    const formData = new FormData(e.currentTarget)
    await initiateSeparationAction(formData, employee.id)
    setInitiateLoading(false)
    setIsInitiateOpen(false)
  }

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!activeSeparation) return
    setTaskLoading(true)
    const formData = new FormData(e.currentTarget)
    await createOffboardingTaskAction(formData, activeSeparation.id, employee.id)
    setTaskLoading(false)
    setIsTaskOpen(false)
  }

  const handleFinalize = async () => {
    if (!activeSeparation) return
    setFinalizeLoading(true)
    await finalizeSeparationAction(activeSeparation.id, employee.id)
    setFinalizeLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-bold tracking-tight">{candidate?.full_name || 'Unknown Employee'}</h2>
            <Badge variant={employee.status === 'ACTIVE' ? 'default' : employee.status === 'SEPARATED' ? 'destructive' : 'secondary'}>
              {employee.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {employee.designation} in {employee.department}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-[600px] grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="separation">Separation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Email</span>
                  {candidate?.email}
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Phone</span>
                  {candidate?.phone}
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Joining Date</span>
                  {employee.joining_date || 'N/A'}
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Employee Code</span>
                  {employee.employee_code || 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <PerformanceView employee={employee} />
        </TabsContent>

        <TabsContent value="separation" className="mt-4">
          {activeSeparation ? (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Offboarding Tasks</CardTitle>
                      <CardDescription>Track asset recovery and exit steps</CardDescription>
                    </div>
                    <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
                      <DialogTrigger render={<Button variant="outline">Add Task</Button>} />
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Offboarding Task</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Task Title</Label>
                            <Input id="title" name="title" required placeholder="e.g. Recover Laptop" />
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
                    {activeSeparation.offboarding_tasks?.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        No offboarding tasks added.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeSeparation.offboarding_tasks?.map((task: any) => (
                          <div key={task.id} className="flex items-center space-x-3 border p-3 rounded-md">
                            <Checkbox checked={task.status === 'COMPLETED'} />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{task.title}</div>
                              <div className="text-xs text-muted-foreground">Due: {task.due_date || 'No Date'}</div>
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
                    <CardTitle>Separation Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">Type</span>
                      {activeSeparation.type}
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Reason</span>
                      {activeSeparation.reason || 'N/A'}
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Last Working Day</span>
                      <span className="font-bold text-red-600">{activeSeparation.last_working_day}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Finalize Separation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Confirm that all offboarding tasks are completed and access is revoked.
                    </p>
                    <Button 
                      className="w-full" 
                      variant="destructive"
                      disabled={finalizeLoading}
                      onClick={handleFinalize}
                    >
                      {finalizeLoading ? "Processing..." : "Complete Offboarding"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : employee.status === 'SEPARATED' ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-muted-foreground">This employee has been separated from the organization.</div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Initiate Separation</CardTitle>
                <CardDescription>Log a resignation or termination to begin offboarding</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isInitiateOpen} onOpenChange={setIsInitiateOpen}>
                  <DialogTrigger render={<Button variant="destructive">Initiate Separation</Button>} />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Initiate Separation</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleInitiateSeparation} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Separation Type</Label>
                        <Select name="type" defaultValue="RESIGNATION">
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RESIGNATION">Resignation</SelectItem>
                            <SelectItem value="TERMINATION">Termination</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastWorkingDay">Last Working Day</Label>
                        <Input id="lastWorkingDay" name="lastWorkingDay" type="date" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason (Optional)</Label>
                        <Input id="reason" name="reason" placeholder="Personal reasons, Performance, etc." />
                      </div>
                      <Button type="submit" variant="destructive" className="w-full" disabled={initiateLoading}>
                        {initiateLoading ? "Initiating..." : "Initiate Separation"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
