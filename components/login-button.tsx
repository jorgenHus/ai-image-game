"use client"

import { Button } from "@/components/ui/button"
import { signIn, signOut } from "next-auth/react"
import { useLanguage } from "./language-provider"
import type { Session } from "next-auth"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function LoginButton({ session }: { session: Session | null }) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      await signIn("google", { callbackUrl: "/" })
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (session) {
    return (
      <Button variant="outline" onClick={handleSignOut} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("logout")}...
          </>
        ) : (
          t("logout")
        )}
      </Button>
    )
  }

  return (
    <Button onClick={handleSignIn} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("login")}...
        </>
      ) : (
        t("login")
      )}
    </Button>
  )
}

