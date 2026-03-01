"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, ArrowRight } from "lucide-react";

export default function ProductCard({ product, postCount = 0 }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{postCount} posts generated</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Link href={`/products/${product.id}`} className="flex-1">
          <Button variant="outline" className="w-full" size="sm">
            View Posts <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
        <Link href={`/products/${product.id}/generate`}>
          <Button size="sm">Generate</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
