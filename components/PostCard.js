"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Check,
  SkipForward,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
} from "lucide-react";

const statusColors = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  published: "bg-green-50 text-green-700 border-green-200",
  skipped: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

export default function PostCard({ post, onStatusChange, onRegenerate }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleStatusChange(newStatus) {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      onStatusChange?.(updated);
      toast({
        title: `Post ${newStatus}`,
        description: `Marked as ${newStatus} successfully.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Show first 3 lines when collapsed
  const bodyLines = post.body.split("\n");
  const previewText = bodyLines.slice(0, 3).join("\n");
  const hasMore = bodyLines.length > 3 || post.body.length > 200;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              r/{post.subreddit}
            </Badge>
            <Badge className={statusColors[post.status]}>
              {post.status}
            </Badge>
          </div>
          {post.best_time_to_post && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {post.best_time_to_post}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-base mt-2">{post.title}</h3>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {expanded ? post.body : previewText + (hasMore ? "..." : "")}
        </div>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Read more
              </>
            )}
          </button>
        )}

        {post.why_this_subreddit && (
          <p className="mt-3 text-xs text-muted-foreground/70 flex items-start gap-1">
            <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
            {post.why_this_subreddit}
          </p>
        )}
      </CardContent>

      <CardFooter className="gap-2 flex-wrap">
        {post.status !== "published" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange("published")}
            disabled={loading}
          >
            <Check className="h-3 w-3 mr-1" />
            Mark Published
          </Button>
        )}
        {post.status !== "skipped" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleStatusChange("skipped")}
            disabled={loading}
          >
            <SkipForward className="h-3 w-3 mr-1" />
            Skip
          </Button>
        )}
        {onRegenerate && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRegenerate(post.id)}
            disabled={loading}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Regenerate
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
