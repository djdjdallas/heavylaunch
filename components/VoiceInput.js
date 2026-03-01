"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

/**
 * Voice extraction component — lets users describe their product by speaking.
 * Uses the Web Speech API (SpeechRecognition) for real-time transcription,
 * with a fallback to the MediaRecorder + OpenAI Whisper API for browsers
 * that don't support SpeechRecognition natively.
 *
 * Props:
 *  - onTranscript(text): called with the final transcribed text
 *  - placeholder: hint text shown when idle
 */
export default function VoiceInput({ onTranscript, placeholder = "Click the mic and describe your product..." }) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const { toast } = useToast();

  // Check if browser supports SpeechRecognition
  const hasSpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const startNativeSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        toast({
          title: "Voice input error",
          description: `Speech recognition error: ${event.error}`,
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setRecording(false);
      if (finalTranscript.trim()) {
        onTranscript?.(finalTranscript.trim());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }, [onTranscript, toast]);

  // Fallback: record audio and send to Whisper API
  const startMediaRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop all audio tracks
        stream.getTracks().forEach((t) => t.stop());

        if (chunksRef.current.length === 0) return;

        setProcessing(true);
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error("Transcription failed");

          const data = await res.json();
          if (data.text) {
            setTranscript(data.text);
            onTranscript?.(data.text);
          }
        } catch (err) {
          toast({
            title: "Transcription failed",
            description: err.message,
            variant: "destructive",
          });
        } finally {
          setProcessing(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive",
      });
    }
  }, [onTranscript, toast]);

  function toggleRecording() {
    if (recording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      setRecording(false);
    } else {
      // Start recording — prefer native SpeechRecognition
      setTranscript("");
      if (hasSpeechRecognition) {
        startNativeSpeechRecognition();
      } else {
        startMediaRecording();
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant={recording ? "destructive" : "outline"}
          size="sm"
          onClick={toggleRecording}
          disabled={processing}
          className="gap-2"
        >
          {processing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : recording ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          {processing
            ? "Transcribing..."
            : recording
            ? "Stop Recording"
            : "Voice Input"}
        </Button>
        {recording && (
          <span className="flex items-center gap-1.5 text-xs text-red-500">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Listening...
          </span>
        )}
      </div>

      {transcript && (
        <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 p-3 text-sm text-muted-foreground">
          {transcript}
        </div>
      )}

      {!recording && !transcript && (
        <p className="text-xs text-muted-foreground">{placeholder}</p>
      )}
    </div>
  );
}
