"use client"

import { useState } from "react"
import { applyToJobAction } from "@/app/actions/apply"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ApplicationForm({ jobId, orgId }: { jobId: string, orgId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    formData.append('jobId', jobId)
    formData.append('orgId', orgId)
    
    const result = await applyToJobAction(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="mt-8">
        <CardContent className="pt-6 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h3 className="text-xl font-bold">Application Submitted!</h3>
          <p className="text-gray-500 mt-2">Thank you for applying. The team will review your application shortly.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Apply for this position</CardTitle>
        <CardDescription>Submit your resume and contact information below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm font-medium text-destructive">{error}</div>}
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" name="fullName" required placeholder="John Doe" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" name="email" type="email" required placeholder="john@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume (PDF, DOCX) *</Label>
            <Input id="resume" name="resume" type="file" required accept=".pdf,.doc,.docx" />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting Application..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
