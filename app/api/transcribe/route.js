import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert the uploaded blob to a File object that OpenAI accepts
    const file = new File([audioFile], "recording.webm", {
      type: audioFile.type || "audio/webm",
    });

    // Send to OpenAI Whisper for transcription
    const openai = getOpenAI();
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "en",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
