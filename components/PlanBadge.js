"use client";

import { Badge } from "@/components/ui/badge";

const planColors = {
  free: "bg-zinc-100 text-zinc-700 border-zinc-200",
  starter: "bg-blue-50 text-blue-700 border-blue-200",
  pro: "bg-violet-50 text-violet-700 border-violet-200",
};

export default function PlanBadge({ plan }) {
  return (
    <Badge className={planColors[plan] || planColors.free}>
      {plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Free"}
    </Badge>
  );
}
