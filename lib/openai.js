import OpenAI from "openai";

// Lazy-initialize to avoid build-time errors when env vars aren't set
let _openai;

export function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}
