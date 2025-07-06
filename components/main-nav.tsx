"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { onAuthStateChanged, getAuth, User } from "firebase/auth"
import { Search, Home, Briefcase, PenSquare, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserButton } from "@/components/user-button"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { SearchBox } from "./searchBox"

// Define navigation items in one place that can be exported and reused
export const navItems = [
  { href: "/", label: "Home", icon: <Home className="h-4 w-4" /> },
  { href: "/interviews", label: "Interviews", icon: <Briefcase className="h-4 w-4" /> },
  { href: "/submit", label: "Submit", icon: <PenSquare className="h-4 w-4" /> },
  { href: "/chat", label: "AI Chat", icon: <MessageSquare className="h-4 w-4" /> },
]

export function MainNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      return setUser(user)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md shadow-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left Side: Logo + Search */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 pl-2">
            <span className="text-2xl font-bold tracking-wide text-blue-800 dark:text-white">
              PrepInsight
            </span>
          </Link>

          {/* Search Box (Visible on Large Screens) */}
          <div className="hidden lg:flex relative">
            <SearchBox />
          </div>

          {/* Search Icon for Mobile */}
          <button
            className="lg:hidden p-2 text-muted-foreground hover:text-primary"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Search (Conditionally rendered) */}
        {showMobileSearch && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-background p-4 border-b z-50">
            <SearchBox />
          </div>
        )}

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = item.href === "/"
              ? pathname === item.href
              : pathname?.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded-md relative transition-colors",
                  isActive
                    ? "text-primary after:absolute after:bottom-[-2px] after:left-0 after:h-0.5 after:w-full after:bg-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Side: Theme Toggle + Auth Buttons */}
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />

          {user ? (
            <UserButton />
          ) : (
            <>
              {/* Sign In / Sign Up (Visible on Larger Screens) */}
              <div className="hidden sm:flex">
                <Link href="/login">
                  <Button size="sm" variant="outline" className="rounded-full mr-2">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="rounded-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* Mobile Navigation */}
          <MobileNav>
            {!user && (
              <div className="flex flex-col gap-3 mt-4">
                <Link href="/login">
                  <Button size="sm" variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </MobileNav>
        </div>
      </div>
    </div>
  )
}
