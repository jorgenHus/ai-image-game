import { LoginButton } from "@/components/login-button"
import { LanguageSwitch } from "@/components/language-switch"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { GameInterface } from "@/components/game-interface"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Bilde Spill
          </h1>
          <div className="flex items-center gap-4">
            <LanguageSwitch />
            <LoginButton session={session} />
          </div>
        </div>
        {session ? (
          <GameInterface />
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Velkommen til AI Bilde Spill!</h2>
            <p className="text-muted-foreground mb-8">
              Logg inn for å begynne å lære og ha det gøy med AI-genererte bilder.
            </p>
            <LoginButton session={session} />
          </div>
        )}
      </div>
    </main>
  )
}

