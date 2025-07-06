"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"
import axios from "axios"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (!loading) {
        if (!user) {
          router.push("/login")
          return
        }

        try {
          // Verify admin status with the backend API
          const token = localStorage.getItem("authToken")
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/admin-verify`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          if (response.data.isAdmin) {
            setChecking(false)
          } else {
            router.push("/unauthorized")
          }
        } catch (error) {
          console.error("Error verifying admin status:", error)
          router.push("/unauthorized")
        }
      }
    }

    verifyAdminStatus()
  }, [user, loading, router])

  if (loading || checking) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Verifying admin access...</span>
      </div>
    )
  }

  return <>{children}</>
}
