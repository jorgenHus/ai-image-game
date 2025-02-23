"use client";

import type React from "react";

import { createContext, useContext, useState } from "react";

type Language = "no" | "en";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const translations = {
  no: {
    welcome: "Velkommen til AI Bilde Spill!",
    login: "Logg inn",
    logout: "Logg ut",
    start: "Start Spill",
    enterPrompt: "Beskriv bildet du vil lage her... Vær kreativ! 🎨",
    generate: "Generer Bilde",
    target: "Målbilde",
    yours: "Ditt Bilde",
    score: "Poeng",
    tryAgain: "Prøv Igjen",
    generating: "Genererer...",
    errorGenerating: "Kunne ikke generere bilde. Vennligst prøv igjen.",
    greatScore: "Fantastisk! Bildene er veldig like! 🎉",
    goodScore: "Bra jobbet! Prøv å få bildene enda mer like! 👍",
    tryAgainScore: "Prøv igjen! Tenk på hva som gjør bildene forskjellige 🤔",
    comparing: "Sammenligner bildene...",
    errorComparing: "Kunne ikke sammenligne bildene. Vennligst prøv igjen.",
    bestScore: "Beste poengsum",
    totalAttempts: "Totale forsøk",
    next: "Neste Bilde",
  },
  en: {
    welcome: "Welcome to AI Image Game!",
    login: "Log in",
    logout: "Log out",
    start: "Start Game",
    enterPrompt:
      "Describe the image you want to create here... Be creative! 🎨",
    generate: "Generate Image",
    target: "Target Image",
    yours: "Your Image",
    score: "Score",
    tryAgain: "Try Again",
    generating: "Generating...",
    errorGenerating: "Failed to generate image. Please try again.",
    greatScore: "Amazing! The images are very similar! 🎉",
    goodScore: "Good job! Try to make the images even more similar! 👍",
    tryAgainScore: "Try again! Think about what makes the images different 🤔",
    comparing: "Comparing images...",
    errorComparing: "Failed to compare images. Please try again.",
    bestScore: "Best score",
    totalAttempts: "Total attempts",
    next: "Next Picture",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("no");

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations.no] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
