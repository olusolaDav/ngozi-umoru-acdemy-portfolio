"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, X, FileText, Search } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface UploadingFile {
  file: File
  progress: number
  timeLeft: string
  status: "uploading" | "complete" | "error"
}

export default function UploadResourcesPage() {
  const router = useRouter()
  const [uploadingFile, setUploadingFile] = useState<UploadingFile | null>(null)
  const [fileName, setFileName] = useState("")
  const [description, setDescription] = useState("")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setFileName(file.name.replace(/\.[^/.]+$/, ""))

      // Simulate upload progress
      setUploadingFile({
        file,
        progress: 0,
        timeLeft: "Calculating...",
        status: "uploading",
      })

      // Simulate progress
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setUploadingFile((prev) =>
            prev ? { ...prev, progress: 100, status: "complete", timeLeft: "Complete" } : null,
          )
        } else {
          const timeLeft = Math.ceil((100 - progress) / 3.5)
          setUploadingFile((prev) =>
            prev
              ? {
                  ...prev,
                  progress: Math.round(progress),
                  timeLeft: `${timeLeft} Sec left`,
                }
              : null,
          )
        }
      }, 300)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  })

  const handleCancelUpload = () => {
    setUploadingFile(null)
    setFileName("")
  }

  const handleSubmit = () => {
    // In real app, this would submit to API
    console.log("Upload resource:", { fileName, description, file: uploadingFile?.file })
    router.push("/admin/resources")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Upload Resources</h1>
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Upload Area */}
      <div className="mx-auto max-w-xl space-y-6">
        {/* Drag & Drop Zone */}
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mb-1 text-center font-medium">Drag & Drop or Choose File to Upload</p>
          <p className="mb-4 text-center text-sm text-muted-foreground">DOCX, DOC, and PDF up to 10MB.</p>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Search className="h-4 w-4" />
            Browse
          </Button>
        </div>

        {/* Upload Progress */}
        {uploadingFile && (
          <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">New Document</p>
                <button onClick={handleCancelUpload}>
                  <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                {(uploadingFile.file.size / (1024 * 1024)).toFixed(1)} MB - {uploadingFile.timeLeft} -{" "}
                {uploadingFile.progress}% Completed
              </p>
              {/* Progress Bar */}
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 via-cyan-500 to-blue-300 transition-all duration-300"
                  style={{ width: `${uploadingFile.progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Document Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Document Details</h2>
          <Input placeholder="File Name" value={fileName} onChange={(e) => setFileName(e.target.value)} />
          <Textarea
            placeholder="Describe the file shortly"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.back()} className="min-w-32">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!uploadingFile || uploadingFile.status !== "complete"}
            className="min-w-32 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
          >
            Upload Document
          </Button>
        </div>
      </div>
    </div>
  )
}
