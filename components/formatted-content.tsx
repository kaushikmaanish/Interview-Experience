"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import type { Components } from "react-markdown"

interface FormattedContentProps {
  content: string
  className?: string
}

export function FormattedContent({ content, className }: FormattedContentProps) {
  const components: Components = {
    h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>,
    p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="mb-1">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4">{children}</blockquote>
    ),
    code: ({ node, className, children, ...props }) => {
      const inline = (props as { inline?: boolean }).inline
      const match = /language-(\w+)/.exec(className || "")

      if (!inline && match) {
        return (
          <div className="rounded-md my-4 overflow-hidden">
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              customStyle={{
                margin: 0,
                padding: "1rem",
                fontSize: "0.875rem",
                lineHeight: 1.5,
              }}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          </div>
        )
      }

      return (
        <code className="bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono">
          {children}
        </code>
      )
    },
  }

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className || ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
