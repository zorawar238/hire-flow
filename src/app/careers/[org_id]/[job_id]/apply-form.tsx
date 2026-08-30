'use client'

import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { submitApplicationAction } from "@/app/actions/candidates"

const applySchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number is required"),
  location: z.string().min(2, "Location is required"),
  currentCompany: z.string().optional(),
  currentDesignation: z.string().optional(),
  totalExperience: z.string().optional(),
  expectedSalary: z.string().optional(),
  noticePeriod: z.string().optional(),
  resume: z.any()
    .refine((file) => file instanceof File, "Resume is required.")
    .refine((file) => file?.size <= 5 * 1024 * 1024, `Max file size is 5MB.`)
    .refine(
      (file) => ['application/pdf'].includes(file?.type),
      "Only .pdf format is supported."
    ),
})

export default function ApplyForm({ orgId, jobId }: { orgId: string, jobId: string }) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof applySchema>>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      currentCompany: "",
      currentDesignation: "",
      totalExperience: "",
      expectedSalary: "",
      noticePeriod: "",
      resume: undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof applySchema>) {
    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append("fullName", values.fullName)
    formData.append("email", values.email)
    formData.append("phone", values.phone)
    formData.append("location", values.location)
    if (values.currentCompany) formData.append("currentCompany", values.currentCompany)
    if (values.currentDesignation) formData.append("currentDesignation", values.currentDesignation)
    if (values.totalExperience) formData.append("totalExperience", values.totalExperience)
    if (values.expectedSalary) formData.append("expectedSalary", values.expectedSalary)
    if (values.noticePeriod) formData.append("noticePeriod", values.noticePeriod)
    formData.append("resume", values.resume)
    
    const result = await submitApplicationAction(formData, orgId, jobId)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="text-2xl text-green-600 font-bold">🎉 Application Submitted!</div>
        <p className="text-muted-foreground">Thank you for applying. The team will review your application and get back to you shortly.</p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="text-sm font-medium text-destructive">{error}</div>}
        
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone *</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Location *</FormLabel>
              <FormControl>
                <Input placeholder="New York, NY" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Experience (Yrs)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="4.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="noticePeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notice Period (Days)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="resume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resume (PDF) *</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => field.onChange(e.target.files?.[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </Form>
  )
}
