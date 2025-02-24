"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "./language-provider";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const FETCH_TIMEOUT = 60000; // 60 seconds

export function GameInterface() {
  const { t, language } = useLanguage();
  const [gameStarted, setGameStarted] = useState(false);
  const [targetImage, setTargetImage] = useState("");
  const [targetPrompt, setTargetPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const fetchWithTimeout = async (url: string, options: RequestInit) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          t("timeoutError") || "Request timed out. Please try again."
        );
      }
      throw error;
    }
  };

  const startGame = async () => {
    setLoading(true);
    try {
      const data = await fetchWithTimeout("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: language,
          mode: "random",
        }),
      });

      setTargetImage(data.url);
      setTargetPrompt(data.prompt);
      setGameStarted(true);
      setGeneratedImage("");
      setPrompt("");
      setScore(null);
    } catch (error) {
      console.error("Failed to start game:", error);
      toast.error(
        error instanceof Error ? error.message : t("errorGenerating")
      );
    } finally {
      setLoading(false);
    }
  };

  const nextPicture = async () => {
    if (score !== null) {
      setBestScore((prev) => Math.max(prev, score));
      await startGame();
    }
  };

  const generateImage = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const data = await fetchWithTimeout("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          mode: "user",
        }),
      });

      setGeneratedImage(data.url);

      // Add a small delay to ensure the image is available
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { score, error } = await fetchWithTimeout("/api/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetImage,
          generatedImage: data.url,
        }),
      });

      if (error) {
        throw new Error(error);
      }

      setScore(score);
      setTotalAttempts((prev) => prev + 1);
      setBestScore((prev) => Math.max(prev, score));

      if (score > 80) {
        toast.success(t("greatScore"));
      } else if (score > 60) {
        toast(t("goodScore"));
      } else {
        toast(t("tryAgainScore"));
      }
    } catch (error) {
      console.error("Failed to generate or compare image:", error);
      toast.error(
        error instanceof Error ? error.message : t("errorGenerating")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!gameStarted) {
    return (
      <div className="text-center py-20">
        <Button onClick={startGame} disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            t("start")
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-4">
          <h3 className="text-2xl font-bold mb-4 text-center text-primary">
            {t("target")}
          </h3>
          <div className="relative aspect-square">
            <Image
              src={targetImage || "/placeholder.svg?height=512&width=512"}
              alt="Target image"
              fill
              unoptimized
              className="object-cover rounded-lg"
            />
          </div>
          {targetPrompt && (
            <p className="mt-4 text-center text-muted-foreground">
              {targetPrompt}
            </p>
          )}
        </Card>
        <Card className="p-4">
          <h3 className="text-2xl font-bold mb-4 text-center text-primary">
            {t("yours")}
          </h3>
          <div className="relative aspect-square">
            {generatedImage ? (
              <Image
                src={generatedImage || "/placeholder.svg"}
                alt="Generated image"
                fill
                unoptimized
                className="object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <p className="text-lg text-muted-foreground">
                    {t("enterPrompt")}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="flex flex-col items-center gap-6">
        {score !== null && (
          <>
            <div className="text-3xl font-bold text-primary">
              {t("score")}: {score}%
            </div>
            {bestScore > 0 && (
              <div className="text-xl text-muted-foreground">
                {t("bestScore")}: {bestScore}%
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              {t("totalAttempts")}: {totalAttempts}
            </div>
          </>
        )}
        <div className="w-full max-w-2xl space-y-4">
          <Textarea
            placeholder={t("enterPrompt")}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            className="min-h-[120px] text-lg p-4 rounded-xl"
            rows={4}
          />
          <div className="flex gap-4 justify-center">
            <Button
              onClick={generateImage}
              disabled={!prompt || loading}
              size="lg"
              className="text-lg px-8 py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  {t("generating")}
                </>
              ) : (
                t("generate")
              )}
            </Button>
            {score !== null && (
              <Button
                onClick={nextPicture}
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
              >
                {t("next")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
