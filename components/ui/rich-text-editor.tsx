"use client"

import { forwardRef, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
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
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    ),
  }
)

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  className?: string
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["link"],
    ["clean"],
  ],
}

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "color",
  "background",
  "link",
]

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your message...",
  minHeight = "150px",
  className = "",
}: RichTextEditorProps) {
  const quillRef = useRef<any>(null)

  return (
    <div className={`rich-text-editor ${className}`}>
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: ${minHeight};
          font-size: 14px;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background: hsl(var(--muted) / 0.5);
        }
        .rich-text-editor .ql-editor {
          min-height: ${minHeight};
          line-height: 1.75;
        }
        .rich-text-editor .ql-editor p {
          margin: 0 0 1rem 0;
          line-height: 1.75;
        }
        .rich-text-editor .ql-editor h1,
        .rich-text-editor .ql-editor h2,
        .rich-text-editor .ql-editor h3,
        .rich-text-editor .ql-editor h4,
        .rich-text-editor .ql-editor h5,
        .rich-text-editor .ql-editor h6 {
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .rich-text-editor .ql-editor ul,
        .rich-text-editor .ql-editor ol {
          margin-bottom: 1rem;
          padding-left: 1.25rem;
        }
        .rich-text-editor .ql-editor li {
          margin-bottom: 0.4rem;
        }
        /* Ensure the toolbar icons and controls are not affected by editor line-height */
        .rich-text-editor .ql-toolbar,
        .rich-text-editor .ql-toolbar * {
          line-height: normal !important;
          vertical-align: middle;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: hsl(var(--muted-foreground));
        }
        .dark .rich-text-editor .ql-toolbar {
          border-color: hsl(var(--border));
          background: hsl(var(--muted) / 0.3);
        }
        .dark .rich-text-editor .ql-container {
          border-color: hsl(var(--border));
        }
        .dark .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        .dark .rich-text-editor .ql-toolbar .ql-fill {
          fill: hsl(var(--foreground));
        }
        .dark .rich-text-editor .ql-toolbar .ql-picker {
          color: hsl(var(--foreground));
        }
        .dark .rich-text-editor .ql-editor {
          color: hsl(var(--foreground));
        }
      `}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  )
}
