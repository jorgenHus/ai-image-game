"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "./language-provider"

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage()

  return (
    <Button variant="outline" onClick={() => setLanguage(language === "no" ? "en" : "no")} className="w-20">
      {language === "no" ? "English" : "Norsk"}
    </Button>
  )
}

