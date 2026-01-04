    "use client"

    import { useState, useEffect, useCallback, useMemo, useRef, forwardRef } from "react"
    import dynamic from "next/dynamic"
    import { Button } from "@/components/ui/button"
    import { Input } from "@/components/ui/input"
    import { Eye, Send, Save, FileText, Clock } from "lucide-react"
    import slugify from "slugify"
    import "react-quill-new/dist/quill.snow.css"

    // Dynamically import ReactQuill with proper ref forwarding
    const ReactQuill = dynamic(
      async () => {
        const { default: RQ } = await import("react-quill-new")
        return forwardRef((props: any, ref: any) => <RQ ref={ref} {...props} />)
      },
      {
        ssr: false,
        loading: () => (
          <div className="flex h-[500px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ),
      }
    )

    interface BlogEditorProps {
      initialTitle?: string
      initialContent?: string
      postId?: string
      onSave?: (data: { title: string; slug: string; content: string; thumbnail?: string | null }) => void | Promise<void>
      onPreview?: () => void
      onPublish?: () => void
    }

    export function BlogEditor({
      initialTitle = "",
      initialContent = "",
      postId,
      onSave,
      onPreview,
      onPublish,
    }: BlogEditorProps) {
      const [title, setTitle] = useState(() => initialTitle || "")
      const [slug, setSlug] = useState(() => initialTitle ? slugify(initialTitle, { lower: true, strict: true }) : "")
      const [content, setContent] = useState(() => initialContent || "")
      const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
      const [wordCount, setWordCount] = useState(0)
      const [readingTime, setReadingTime] = useState(0)
      const [isUploading, setIsUploading] = useState(false)
      const quillRef = useRef<any>(null)
      const fileInputRef = useRef<HTMLInputElement>(null)
      
      // Track if component has initialized to prevent resetting user edits
      const hasInitialized = useRef(false)

      // Debug: Log initial props on mount
      useEffect(() => {
        console.log("BlogEditor mounted with:", { initialTitle, initialContent: initialContent?.substring(0, 100) })
      }, [])

      // Initialize content from props on mount
      useEffect(() => {
        console.log("Init effect running:", { 
          hasInitialized: hasInitialized.current, 
          initialTitle, 
          initialContent: initialContent?.substring(0, 100) 
        })
        // Only initialize once when component mounts with values
        if (!hasInitialized.current && (initialTitle || initialContent)) {
          if (initialTitle) {
            setTitle(initialTitle)
            setSlug(slugify(initialTitle, { lower: true, strict: true }))
          }
          if (initialContent) {
            setContent(initialContent)
          }
          hasInitialized.current = true
          console.log("BlogEditor initialized with content")
        }
      }, [initialTitle, initialContent])

      // Auto-generate slug from title
      useEffect(() => {
        if (title) {
          setSlug(slugify(title, { lower: true, strict: true }))
        } else {
          setSlug("")
        }
      }, [title])

      // Calculate word count and reading time
      useEffect(() => {
        const safeContent = content || ""
        const text = safeContent.replace(/<[^>]+>/g, "")
        const words = text.trim().split(/\s+/).filter(Boolean).length
        setWordCount(words)
        setReadingTime(Math.ceil(words / 200)) // 200 WPM average reading speed
      }, [content])

      // Get first image from content for thumbnail
      const getFirstImage = useCallback(() => {
        const safeContent = content || ""
        const imgMatch = safeContent.match(/<img[^>]+src="([^">]+)"/)
        return imgMatch ? imgMatch[1] : null
      }, [content])

      // Auto-save draft every 5 seconds
      useEffect(() => {
        if (!title && !content) return
        // Don't auto-save if content hasn't been initialized yet
        if (!hasInitialized.current && initialContent) return

        const timer = setTimeout(() => {
          setStatus("saving")
          const thumbnail = getFirstImage()
          // Simulate save - in production, call API
          setTimeout(() => {
            setStatus("saved")
            onSave?.({ title, slug, content, thumbnail })
            // Reset status after 2 seconds
            setTimeout(() => setStatus("idle"), 200000)
          }, 80000)
        }, 50000)

        return () => clearTimeout(timer)
      }, [title, content, slug, onSave, getFirstImage, initialContent])

      // Image upload handler - triggers hidden file input
      const imageHandler = useCallback(() => {
        fileInputRef.current?.click()
      }, [])

      // Handle image file upload
      const handleImageUpload = useCallback(async () => {
        const file = fileInputRef.current?.files?.[0]
        if (!file) return

        setIsUploading(true)

        try {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("folder", "blog_content")

          const res = await fetch("/api/upload/file", {
            method: "POST",
            body: formData,
          })

          if (!res.ok) throw new Error("Upload failed")

          const data = await res.json()
          const imageUrl = data.data.url

          // Insert image into editor
          const quill = quillRef.current?.getEditor?.()
          if (quill) {
            const range = quill.getSelection(true)
            quill.insertEmbed(range.index, "image", imageUrl)
            quill.setSelection(range.index + 1)
          }
        } catch (error) {
          console.error("Image upload error:", error)
          // Fallback to local preview if Cloudinary fails
          const reader = new FileReader()
          reader.onload = (e) => {
            const quill = quillRef.current?.getEditor?.()
            if (quill) {
              const range = quill.getSelection(true)
              quill.insertEmbed(range.index, "image", e.target?.result)
              quill.setSelection(range.index + 1)
            }
          }
          reader.readAsDataURL(file)
        } finally {
          setIsUploading(false)
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
        }
      }, [])

      // Quill toolbar modules configuration - Enhanced like Google Blogger
      const modules = useMemo(
        () => ({
          toolbar: {
            container: [
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              [{ font: [] }],
              [{ size: ["small", false, "large", "huge"] }],
              ["bold", "italic", "underline", "strike"],
              [{ script: "sub" }, { script: "super" }],
              [{ color: [] }, { background: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ align: [] }],
              [{ indent: "-1" }, { indent: "+1" }],
              [{ direction: "rtl" }],
              ["blockquote", "code-block"],
              ["link", "image", "video"],
              ["clean"],
            ],
            handlers: {
              image: imageHandler,
            },
          },
          history: {
            delay: 1000,
            maxStack: 100,
            userOnly: true,
          },
          clipboard: {
            matchVisual: false,
          },
        }),
        [imageHandler],
      )

      // Quill formats configuration - Enhanced
      const formats = [
        "header",
        "font",
        "size",
        "bold",
        "italic",
        "underline",
        "strike",
        "script",
        "color",
        "background",
        "list",
        "align",
        "indent",
        "direction",
        "blockquote",
        "code-block",
        "link",
        "image",
        "video",
      ]

      // Close color pickers when clicking outside
      useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
          const target = e.target as HTMLElement
          if (!target.closest('.ql-picker.ql-expanded')) {
            // Close any open pickers
            document.querySelectorAll('.ql-picker.ql-expanded').forEach((picker) => {
              picker.classList.remove('ql-expanded')
            })
          }
        }

        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
      }, [])

      // Handle save as draft
      const handleSaveDraft = async () => {
        setStatus("saving")
        const thumbnail = getFirstImage()
        console.log("Saving draft with:", { title, slug, content: content?.substring(0, 100), thumbnail })
        
        // Call onSave immediately without setTimeout delay
        try {
          await onSave?.({ title, slug, content, thumbnail })
          setStatus("saved")
          console.log("Draft saved successfully")
          setTimeout(() => setStatus("idle"), 2000)
        } catch (error) {
          console.error("Error saving draft:", error)
          setStatus("idle")
        }
      }

      // Get status display
      const getStatusDisplay = () => {
        switch (status) {
          case "saving":
            return (
              <span className="flex items-center gap-1 text-muted-foreground">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                Saving...
              </span>
            )
          case "saved":
            return <span className="text-green-600">Draft saved</span>
          default:
            return <span className="text-muted-foreground">Unsaved changes</span>
        }
      }

      return (
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title..."
                className="max-w-2xl border-0 border-b border-muted-foreground/30 px-0 text-2xl font-medium placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-0"
              />
              {slug && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Slug: <span className="font-medium text-foreground">{slug}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSaveDraft} className="gap-2 bg-transparent">
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button variant="ghost" onClick={onPreview} className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button
                onClick={onPublish}
                className="gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 text-white hover:from-cyan-600 hover:to-blue-700"
              >
                <Send className="h-4 w-4" />
                Publish
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 border-b border-border bg-muted/30 px-6 py-2 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <FileText className="h-4 w-4" />
              {wordCount} words
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {readingTime} min read
            </span>
            <span className="ml-auto">{getStatusDisplay()}</span>
            {isUploading && (
              <span className="flex items-center gap-1 text-primary">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                Uploading image...
              </span>
            )}
          </div>

          {/* Hidden file input for image uploads */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />

          {/* React-Quill Editor Container */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="quill-wrapper flex-1 overflow-auto bg-muted/30">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="Start writing your blog post..."
                className="blog-editor"
              />
            </div>
          </div>

          {/* Quill Custom Styles */}
          <style jsx global>{`
            .quill-wrapper {
              display: flex;
              flex-direction: column;
              height: 100%;
            }

            .blog-editor {
              display: flex;
              flex-direction: column;
              height: 100%;
            }

            .blog-editor .ql-toolbar {
              border: none;
              border-bottom: 1px solid hsl(var(--border));
              background: hsl(var(--background));
              padding: 12px 16px;
              display: flex;
              flex-wrap: wrap;
              gap: 4px;
              position: sticky;
              top: 0;
              z-index: 10;
            }

            .blog-editor .ql-toolbar .ql-formats {
              margin-right: 8px;
              padding-right: 8px;
              border-right: 1px solid hsl(var(--border));
              display: flex;
              align-items: center;
            }

            .blog-editor .ql-toolbar .ql-formats:last-child {
              border-right: none;
            }

            .blog-editor .ql-toolbar button {
              width: 32px;
              height: 32px;
              padding: 4px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .blog-editor .ql-toolbar button:hover {
              background: hsl(var(--muted));
            }

            .blog-editor .ql-toolbar button.ql-active {
              background: hsl(var(--primary) / 0.1);
              color: hsl(var(--primary));
            }

            .blog-editor .ql-toolbar button.ql-active .ql-stroke {
              stroke: hsl(var(--primary));
            }

            .blog-editor .ql-toolbar button.ql-active .ql-fill {
              fill: hsl(var(--primary));
            }

            .blog-editor .ql-toolbar .ql-picker {
              height: 32px;
            }

            .blog-editor .ql-toolbar .ql-picker-label {
              border: 1px solid transparent;
              border-radius: 6px;
              padding: 4px 8px;
              display: flex;
              align-items: center;
            }

            .blog-editor .ql-toolbar .ql-picker-label:hover {
              background: hsl(var(--muted));
            }

            .blog-editor .ql-toolbar .ql-picker.ql-expanded .ql-picker-label {
              background: hsl(var(--muted));
            }

            .blog-editor .ql-toolbar .ql-picker-options {
              background: hsl(var(--background));
              border: 1px solid hsl(var(--border));
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              padding: 8px;
              margin-top: 4px;
            }

            .blog-editor .ql-toolbar .ql-picker-item {
              padding: 4px 8px;
              border-radius: 4px;
            }

            .blog-editor .ql-toolbar .ql-picker-item:hover {
              background: hsl(var(--muted));
            }

            .blog-editor .ql-container {
              border: none;
              flex: 1;
              display: flex;
              justify-content: center;
              padding: 32px;
              overflow: auto;
              font-family: inherit;
            }

            .blog-editor .ql-editor {
              width: 100%;
              max-width: 800px;
              min-height: 600px;
              background: hsl(var(--background));
              border: 1px solid hsl(var(--border));
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
              font-size: 16px;
              line-height: 1.8;
              color: hsl(var(--foreground));
            }

            .blog-editor .ql-editor.ql-blank::before {
              font-style: normal;
              color: hsl(var(--muted-foreground));
              left: 40px;
              right: 40px;
            }

            .blog-editor .ql-editor h1 {
              font-size: 2.25em;
              font-weight: 700;
              margin-bottom: 0.5em;
              line-height: 1.3;
            }

            .blog-editor .ql-editor h2 {
              font-size: 1.75em;
              font-weight: 600;
              margin-bottom: 0.5em;
              line-height: 1.4;
            }

            .blog-editor .ql-editor h3 {
              font-size: 1.5em;
              font-weight: 600;
              margin-bottom: 0.5em;
              line-height: 1.4;
            }

            .blog-editor .ql-editor p {
              margin-bottom: 1.25em;
            }

            .blog-editor .ql-editor blockquote {
              border-left: 4px solid hsl(var(--primary));
              padding-left: 20px;
              margin: 1.5em 0;
              color: hsl(var(--muted-foreground));
              font-style: italic;
            }

            .blog-editor .ql-editor ul,
            .blog-editor .ql-editor ol {
              padding-left: 1.5em;
              margin-bottom: 1.25em;
            }

            .blog-editor .ql-editor li {
              margin-bottom: 0.5em;
            }

            .blog-editor .ql-editor img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 1.5em 0;
            }

            .blog-editor .ql-editor a {
              color: hsl(var(--primary));
              text-decoration: underline;
              text-underline-offset: 2px;
            }

            .blog-editor .ql-editor a:hover {
              text-decoration-thickness: 2px;
            }

            .blog-editor .ql-editor code {
              background: hsl(var(--muted));
              padding: 3px 8px;
              border-radius: 4px;
              font-family: ui-monospace, monospace;
              font-size: 0.9em;
            }

            .blog-editor .ql-editor pre {
              background: hsl(var(--muted));
              padding: 20px;
              border-radius: 8px;
              overflow-x: auto;
              font-family: ui-monospace, monospace;
              font-size: 0.9em;
              margin: 1.5em 0;
            }

            .blog-editor .ql-editor pre.ql-syntax {
              background: #1e1e1e;
              color: #d4d4d4;
            }

            /* Color picker adjustments */
            .blog-editor .ql-color-picker .ql-picker-options,
            .blog-editor .ql-background .ql-picker-options {
              width: 152px;
              padding: 4px;
              display: none;
              flex-wrap: wrap;
              max-height: 200px;
              overflow-y: auto;
            }

            /* Show picker only when expanded */
            .blog-editor .ql-picker.ql-expanded .ql-picker-options {
              display: flex;
            }

            /* Close picker when clicking outside */
            .blog-editor .ql-picker.ql-expanded .ql-picker-label {
              pointer-events: auto;
            }

            .blog-editor .ql-color-picker .ql-picker-item,
            .blog-editor .ql-background .ql-picker-item {
              width: 16px;
              height: 16px;
              border-radius: 2px;
              margin: 2px;
              border: 1px solid hsl(var(--border));
            }

            .blog-editor .ql-color-picker .ql-picker-item:hover,
            .blog-editor .ql-background .ql-picker-item:hover {
              border-color: hsl(var(--primary));
              transform: scale(1.1);
            }

            /* Video styling */
            .blog-editor .ql-editor .ql-video {
              width: 100%;
              aspect-ratio: 16 / 9;
              border-radius: 8px;
              margin: 1.5em 0;
            }

            /* Subscript and superscript */
            .blog-editor .ql-editor sub {
              vertical-align: sub;
              font-size: 0.75em;
            }

            .blog-editor .ql-editor sup {
              vertical-align: super;
              font-size: 0.75em;
            }

            /* Dark mode support */
            .dark .blog-editor .ql-toolbar {
              background: hsl(var(--background));
            }

            .dark .blog-editor .ql-stroke {
              stroke: hsl(var(--foreground));
            }

            .dark .blog-editor .ql-fill {
              fill: hsl(var(--foreground));
            }

            .dark .blog-editor .ql-picker-label {
              color: hsl(var(--foreground));
            }

            .dark .blog-editor .ql-picker-options {
              background: hsl(var(--background));
              border-color: hsl(var(--border));
            }

            .dark .blog-editor .ql-editor {
              background: hsl(var(--card));
            }

            /* Responsive adjustments */
            @media (max-width: 768px) {
              .blog-editor .ql-container {
                padding: 16px;
              }

              .blog-editor .ql-editor {
                padding: 24px;
                min-height: 400px;
              }

              .blog-editor .ql-editor.ql-blank::before {
                left: 24px;
                right: 24px;
              }

              .blog-editor .ql-toolbar {
                padding: 8px;
                overflow-x: auto;
              }

              .blog-editor .ql-toolbar .ql-formats {
                margin-right: 4px;
                padding-right: 4px;
              }
            }
          `}</style>
        </div>
      )
    }
