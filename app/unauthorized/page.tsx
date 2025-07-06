import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        You don't have permission to access this page. Please contact an administrator if you believe this is a mistake.
      </p>
      <Link href="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  )
}
