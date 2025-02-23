import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// List of prompts in both languages
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
    const { prompt, mode } = await req.json();

    if (mode === "random") {
      // Get a random prompt based on language
      const language = prompt as "no" | "en";
      const promptList = prompts[language];
      const randomPrompt =
        promptList[Math.floor(Math.random() * promptList.length)];

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: randomPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      return NextResponse.json({
        url: response.data[0].url,
        prompt: randomPrompt,
      });
    } else {
      // Generate image from user prompt
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt as string,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      return NextResponse.json({ url: response.data[0].url });
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
