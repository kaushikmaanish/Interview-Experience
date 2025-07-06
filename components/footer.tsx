"use client"

import Link from "next/link"
import { Github, Linkedin, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur-sm">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 py-8 md:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Interview Experience</h3>
            <p className="text-sm text-muted-foreground">
              Helping tech professionals share and learn from real interview experiences.
            </p>
            <div className="flex space-x-3 pt-1">
              <Link href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/interviews" className="text-muted-foreground hover:text-foreground">
                  Interviews
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-muted-foreground hover:text-foreground">
                  Submit
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-muted-foreground hover:text-foreground">
                  AI Chat
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-muted-foreground hover:text-foreground">
                  Interview Prep
                </Link>
              </li>
              <li>
                <Link href="/companies" className="text-muted-foreground hover:text-foreground">
                  Companies
                </Link>
              </li>
              <li>
                <Link href="/salary-data" className="text-muted-foreground hover:text-foreground">
                  Salary Data
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center border-t py-6 md:flex-row md:justify-between">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            Built with ❤️ for the tech community. © {new Date().getFullYear()} Interview Experience Platform.
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground md:mt-0 md:text-right">
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
