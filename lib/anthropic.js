import Anthropic from "@anthropic-ai/sdk";

// Lazy-initialize to avoid build-time errors when env vars aren't set
let _anthropic;

export function getAnthropic() {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _anthropic;
}
