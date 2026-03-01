"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import VoiceInput from "@/components/VoiceInput";
import { Target, ArrowLeft, ArrowRight, Loader2, Mic } from "lucide-react";

const STEPS = [
  { title: "Product Basics", description: "Name and URL of your product" },
  { title: "Audience & Problem", description: "Who it's for and what it solves" },
  { title: "Description", description: "Tell us more about your product" },
];

export default function NewProductPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    target_audience: "",
    problem_solved: "",
    description: "",
  });
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createBrowserSupabaseClient();

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  // Handle voice transcript — parse into fields based on current step
  function handleVoiceTranscript(text) {
    if (step === 0) {
      // On the basics step, put voice into name if empty
      if (!formData.name) updateField("name", text);
    } else if (step === 1) {
      // On audience step, put into target_audience or problem_solved
      if (!formData.target_audience) updateField("target_audience", text);
      else if (!formData.problem_solved) updateField("problem_solved", text);
    } else if (step === 2) {
      // On description step, append to description
      updateField("description", formData.description ? formData.description + " " + text : text);
    }
  }

  function canAdvance() {
    if (step === 0) return formData.name && formData.url;
    if (step === 1) return formData.target_audience && formData.problem_solved;
    if (step === 2) return formData.description;
    return false;
  }

  async function handleSubmit() {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        user_id: user.id,
        name: formData.name,
        url: formData.url,
        target_audience: formData.target_audience,
        problem_solved: formData.problem_solved,
        description: formData.description,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error creating product",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({ title: "Product created", description: "Now let's generate some posts!" });
    router.push(`/products/${data.id}/generate`);
  }

  const progressPercent = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg">ThreadPilot</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Dashboard
        </Link>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            {STEPS.map((s, i) => (
              <span
                key={s.title}
                className={i <= step ? "text-foreground font-medium" : "text-muted-foreground"}
              >
                {s.title}
              </span>
            ))}
          </div>
          <Progress value={progressPercent} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step].title}</CardTitle>
            <CardDescription>{STEPS[step].description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Voice input available on all steps */}
            <div className="border-b pb-4">
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                placeholder="Or use your voice to describe this..."
              />
            </div>

            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. ThreadPilot"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Product URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://yourproduct.com"
                    value={formData.url}
                    onChange={(e) => updateField("url", e.target.value)}
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Textarea
                    id="audience"
                    placeholder="e.g. Indie hackers and startup founders who want to grow organically on Reddit"
                    rows={3}
                    value={formData.target_audience}
                    onChange={(e) => updateField("target_audience", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="problem">Problem Solved</Label>
                  <Textarea
                    id="problem"
                    placeholder="e.g. Writing authentic Reddit posts is time-consuming and most founders sound too promotional"
                    rows={3}
                    value={formData.problem_solved}
                    onChange={(e) => updateField("problem_solved", e.target.value)}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <Label htmlFor="description">Product Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what your product does, its key features, and why people love it..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canAdvance()}>
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canAdvance() || loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Product
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
