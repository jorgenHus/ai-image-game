import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define error types
type OpenAIError = {
  name: string;
  message: string;
  status?: number;
};

const prompts = {
  no: [
    "En søt kattunge som leker med et garnnøste",
    "Et fargerikt undervannseventyr med tropiske fisker",
    "En magisk skog med glødende sopper",
    "Et koselig trehusferie i skogen",
    "En fantasifull lekeplass med regnbuerutsjebane",
  ],
  en: [
    "A cute kitten playing with a ball of yarn",
    "A colorful underwater adventure with tropical fish",
    "A magical forest with glowing mushrooms",
    "A cozy treehouse vacation in the woods",
    "A whimsical playground with rainbow slides",
  ],
};

export async function POST(req: Request) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    const { prompt, mode } = await req.json();

    let imagePrompt: string;
    if (mode === "random") {
      const language = prompt as "no" | "en";
      const promptList = prompts[language];
      imagePrompt = promptList[Math.floor(Math.random() * promptList.length)];
    } else {
      imagePrompt = prompt as string;
    }

    const response = await openai.images.generate(
      {
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      },
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    return NextResponse.json(
      mode === "random"
        ? { url: response.data[0].url, prompt: imagePrompt }
        : { url: response.data[0].url }
    );
  } catch (error: unknown) {
    // Type guard for error handling
    const err = error as OpenAIError;
    console.error("Error generating image:", err);

    if (err.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 504 }
      );
    }

    // Handle OpenAI API errors with status codes
    if (err.status) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
