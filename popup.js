const defaults = {
  apiKey: "",
  model: "gpt-4o-mini",
  tone: "professional",
  suggestionCount: 3,
  maxWords: 45
};

const fields = {
  apiKey: document.getElementById("apiKey"),
  model: document.getElementById("model"),
  tone: document.getElementById("tone"),
  suggestionCount: document.getElementById("suggestionCount"),
  maxWords: document.getElementById("maxWords")
};

(async function init() {
  const settings = await chrome.storage.sync.get(defaults);
  for (const key of Object.keys(fields)) {
    fields[key].value = settings[key];
  }
})();

document.getElementById("save").addEventListener("click", async () => {
  const payload = {
    apiKey: fields.apiKey.value.trim(),
    model: fields.model.value.trim() || defaults.model,
    tone: fields.tone.value,
    suggestionCount: clampNumber(fields.suggestionCount.value, 1, 6, defaults.suggestionCount),
    maxWords: clampNumber(fields.maxWords.value, 10, 120, defaults.maxWords)
  };

  await chrome.storage.sync.set(payload);
  const saved = document.getElementById("saved");
  saved.textContent = "Saved";
  setTimeout(() => {
    saved.textContent = "";
  }, 1200);
});

function clampNumber(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
}
