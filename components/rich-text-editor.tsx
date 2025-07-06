"use client"

import { useState } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'blockquote', 'code-block',
  'link', 'code'
]

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean']
  ],
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [wordCount, setWordCount] = useState(0)

  const handleChange = (content: string) => {
    onChange(content)
    const text = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    setWordCount(text === "" ? 0 : text.split(" ").length)
  }

  return (
    <div className="border border-gray-300 rounded-md p-2 shadow-sm">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        placeholder={placeholder || "Start writing your content here..."}
        formats={formats}
        modules={modules}
        className="[&_.ql-editor]:min-h-[200px]"
        aria-label="Rich text editor"
      />
      <div className="mt-2 text-sm text-gray-500 flex justify-between">
        <span>Word count: {wordCount}</span>
        <span>Characters: {value.length}/10,000</span>
      </div>
    </div>
  )
}
