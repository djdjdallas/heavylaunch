"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

const loadingMessages = [
  "Analyzing your product...",
  "Finding the best subreddits...",
  "Studying subreddit cultures...",
  "Writing authentic posts...",
  "Optimizing for engagement...",
  "Adding finishing touches...",
];

export default function GenerateButton({ productId, onSuccess, onError, disabled }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setMessage(loadingMessages[0]);

    // Cycle through loading messages to show progress
    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setMessage(loadingMessages[msgIndex]);
    }, 3000);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate posts");
      }

      onSuccess?.(data.posts);
    } catch (err) {
      onError?.(err.message);
    } finally {
      clearInterval(interval);
      setLoading(false);
      setMessage("");
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        size="lg"
        onClick={handleGenerate}
        disabled={loading || disabled}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {loading ? "Generating..." : "Generate 7 Reddit Posts"}
      </Button>
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
}
