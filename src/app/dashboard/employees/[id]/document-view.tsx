'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Trash2, File, UploadCloud } from "lucide-react"
import { uploadEmployeeDocument, deleteEmployeeDocument } from "@/app/actions/documents"

export default function DocumentView({ employee }: { employee: any }) {
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // In a real app we'd fetch this from the component props or a useQuery hook.
  // We'll assume employee object has an employee_documents array, or we'll mock if undefined.
  const documents = employee.employee_documents || []

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUploading(true)
    const formData = new FormData(e.currentTarget)
    await uploadEmployeeDocument(formData, employee.id)
    setIsUploading(false)
    setIsUploadOpen(false)
  }

  const handleDelete = async (docId: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    setDeletingId(docId)
    await deleteEmployeeDocument(docId, employee.id, fileUrl)
    setDeletingId(null)
  }

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Identity': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Contract': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Tax': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'Performance': return 'bg-amber-100 text-amber-800 border-amber-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>Employee Documents</CardTitle>
            <CardDescription>Securely store and manage HR documents</CardDescription>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Document Name</Label>
                  <Input id="name" name="name" required placeholder="e.g. Identity Proof" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required defaultValue="Identity">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Identity">Identity</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Tax">Tax</SelectItem>
                      <SelectItem value="Performance">Performance</SelectItem>
                      <SelectItem value="Benefits">Benefits</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input id="file" name="file" type="file" required className="cursor-pointer" />
                </div>
                <Button type="submit" className="w-full" disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <File className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-medium text-slate-900">No documents found</p>
              <p className="text-sm">Upload the first document for this employee.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border rounded-lg overflow-hidden">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{doc.name}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${getCategoryColor(doc.category)}`}>
                          {doc.category}
                        </span>
                        <span className="text-xs text-slate-500">
                          Uploaded {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild className="h-8">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        View
                      </a>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      disabled={deletingId === doc.id}
                      onClick={() => handleDelete(doc.id, doc.file_url)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
