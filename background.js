const DEFAULT_SETTINGS = {
  apiKey: "",
  model: "gpt-4o-mini",
  tone: "professional",
  suggestionCount: 3,
  maxWords: 45
};

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  await chrome.storage.sync.set({ ...DEFAULT_SETTINGS, ...current });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "GENERATE_SUGGESTIONS") {
    return;
  }

  generateSuggestions(message.payload)
    .then((suggestions) => sendResponse({ ok: true, suggestions }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});

async function generateSuggestions(payload) {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const {
    apiKey,
    model,
    tone,
    suggestionCount,
    maxWords
  } = { ...DEFAULT_SETTINGS, ...settings };

  if (!apiKey) {
    throw new Error("Add your OpenAI API key in the extension popup/options first.");
  }

  const prompt = buildPrompt({
    postText: payload.postText,
    visibleComments: payload.visibleComments,
    contextType: payload.contextType,
    tone,
    suggestionCount,
    maxWords
  });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content:
            "You write concise, authentic LinkedIn replies. Avoid hashtags and emojis unless naturally relevant."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || "Failed to generate suggestions.";
    throw new Error(message);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content?.trim() || "";
  return normalizeSuggestions(raw, suggestionCount);
}

function buildPrompt({
  postText,
  visibleComments,
  contextType,
  tone,
  suggestionCount,
  maxWords
}) {
  const typeHint =
    contextType === "post"
      ? "Draft short comment replies suitable for a post comment box"
      : "Draft short direct replies to a comment thread";

  return `
${typeHint}.
Tone: ${tone}.
Generate ${suggestionCount} distinct suggestions.
Each suggestion: under ${maxWords} words.
Output format strictly as numbered list.

Post content:
"""
${postText || "No post text found."}
"""

Visible comments/context:
"""
${visibleComments || "No nearby comments found."}
"""

Make suggestions specific, useful, and human.
`.trim();
}

function normalizeSuggestions(text, fallbackCount) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/^\s*\d+[.)-]?\s*/, "").trim())
    .filter(Boolean);

  if (lines.length) {
    return lines.slice(0, fallbackCount);
  }

  return [text || "Thanks for sharing—great perspective and useful context."];
}
