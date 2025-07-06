"use client"
import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { navItems } from "./main-nav" // Import navItems from main-nav

export function MobileNav({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        {/* Mobile Menu Button */}
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="w-9 h-9 p-0">
            <Menu className="h-5 w-5" aria-label="Open Menu" />
          </Button>
        </SheetTrigger>

        {/* Sidebar Navigation */}
        <SheetContent side="right" className="w-[280px] sm:w-[320px] p-6 flex flex-col">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <Link href="/" className="text-lg font-semibold" onClick={() => setOpen(false)}>
              PrepInsight
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" aria-label="Close Menu" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-4 mt-4">
            {navItems.map((item) => {
              const isActive = item.href === "/"
                ? pathname === item.href
                : pathname?.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 text-lg font-medium transition-colors py-2 px-4 rounded-md",
                    isActive ? "bg-primary text-white" : "hover:bg-secondary/50"
                  )}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Auth Buttons (passed as children) */}
          {children && (
            <div className="mt-6 border-t border-border/40 pt-4">
              {children}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto border-t border-border/40 pt-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} PrepInsight
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
