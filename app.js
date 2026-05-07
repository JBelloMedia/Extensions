const form = document.querySelector("#planner-form");
const aboutInput = document.querySelector("#video-about");
const scriptInput = document.querySelector("#voiceover-script");
const modeInput = document.querySelector("#planning-mode");
const styleInput = document.querySelector("#visual-style");
const platformInput = document.querySelector("#platform");
const toneInput = document.querySelector("#tone");
const slidesContainer = document.querySelector("#slides");
const summary = document.querySelector("#summary");
const template = document.querySelector("#slide-template");
const copyButton = document.querySelector("#copy-brief");
const downloadButton = document.querySelector("#download-json");
const printButton = document.querySelector("#print-brief");
const exampleButton = document.querySelector("#load-example");

let currentPlan = null;

const styleSystems = {
  cinematic: {
    palette: "Deep charcoal, electric cyan accents, soft violet shadows, warm highlight flares",
    type: "Condensed bold title type with clean geometric captions",
    texture: "Film grain, light leaks, shallow-depth photo/video panels",
  },
  minimal: {
    palette: "Warm white, graphite, one confident accent color, generous negative space",
    type: "Modern sans-serif with calm hierarchy and restrained captions",
    texture: "Thin rules, simple icons, floating cards, subtle gradients",
  },
  bold: {
    palette: "High-contrast black, neon gradient accents, punchy sticker colors",
    type: "Oversized kinetic headlines with chunky subtitles",
    texture: "Cutout shapes, emojis/icons, speed lines, social post frames",
  },
  documentary: {
    palette: "Muted paper tones, ink black, archival red, desaturated photography",
    type: "Editorial serif headlines paired with utilitarian labels",
    texture: "Torn paper, timestamp overlays, map lines, contact-sheet grids",
  },
  luxury: {
    palette: "Obsidian, champagne gold, ivory, restrained jewel-tone accents",
    type: "Elegant high-contrast serif headlines with minimal captions",
    texture: "Soft reflections, premium product lighting, slow parallax layers",
  },
};

const toneDirectives = {
  inspiring: "Build upward movement, brightening color, and a clear visual sense of progress.",
  educational: "Prioritize clarity, labels, diagrams, and one idea per composition.",
  urgent: "Use compressed spacing, strong contrast, warning accents, and fast directional motion.",
  calm: "Use open space, slower transitions, soft shapes, and breathing-room typography.",
  dramatic: "Use stark light/dark contrast, scale shifts, silhouettes, and suspenseful reveals.",
};

const stopWords = new Set([
  "the",
  "and",
  "you",
  "your",
  "that",
  "this",
  "with",
  "for",
  "from",
  "into",
  "have",
  "will",
  "are",
  "was",
  "were",
  "but",
  "not",
  "can",
  "our",
  "their",
  "about",
  "when",
  "what",
  "why",
  "how",
  "then",
  "than",
  "they",
  "them",
  "all",
  "one",
  "just",
  "like",
  "because",
]);

function splitSentences(script) {
  return script
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function keywordize(text) {
  return [...new Set(text.toLowerCase().match(/[a-z0-9']{3,}/g) || [])]
    .filter((word) => !stopWords.has(word))
    .slice(0, 8);
}

function titleCase(text) {
  return text
    .split(" ")
    .filter(Boolean)
    .slice(0, 7)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function groupByCount(sentences, count) {
  const groups = Array.from({ length: Math.min(count, sentences.length) }, () => []);
  sentences.forEach((sentence, index) => {
    const bucket = Math.min(groups.length - 1, Math.floor((index / sentences.length) * groups.length));
    groups[bucket].push(sentence);
  });
  return groups.filter((group) => group.length);
}

function groupRelatedPhrases(sentences) {
  if (sentences.length <= 3) {
    return sentences.map((sentence) => [sentence]);
  }

  const targetCount = Math.min(6, Math.max(3, Math.ceil(sentences.length / 2)));
  const groups = [];
  let activeGroup = [];
  let activeKeywords = new Set();

  sentences.forEach((sentence) => {
    const sentenceKeywords = keywordize(sentence);
    const overlap = sentenceKeywords.filter((word) => activeKeywords.has(word)).length;
    const shouldStartNew =
      activeGroup.length >= 2 || (activeGroup.length > 0 && overlap === 0 && groups.length < targetCount - 1);

    if (shouldStartNew) {
      groups.push(activeGroup);
      activeGroup = [];
      activeKeywords = new Set();
    }

    activeGroup.push(sentence);
    sentenceKeywords.forEach((word) => activeKeywords.add(word));
  });

  if (activeGroup.length) {
    groups.push(activeGroup);
  }

  return groups;
}

function createGroups(sentences, mode) {
  if (mode === "sentence") {
    return sentences.map((sentence) => [sentence]);
  }

  if (mode === "related-phrases") {
    return groupRelatedPhrases(sentences);
  }

  return groupByCount(sentences, 3);
}

function inferScenePurpose(index, total) {
  if (total === 1) return "Hero message";
  if (index === 0) return "Opening hook";
  if (index === total - 1) return "Resolution / call to action";
  if (index === 1 && total === 3) return "Core tension or explanation";
  return "Development beat";
}

function buildSlide(group, index, total, settings) {
  const combined = group.join(" ");
  const keywords = keywordize(`${settings.about} ${combined}`);
  const mainKeyword = keywords[0] || "idea";
  const secondaryKeyword = keywords[1] || "moment";
  const system = styleSystems[settings.style];
  const scenePurpose = inferScenePurpose(index, total);
  const headline = titleCase(combined.replace(/[.!?]/g, "")) || `Scene ${index + 1}`;
  const visualMetaphor = chooseMetaphor(mainKeyword, index);

  return {
    number: index + 1,
    scenePurpose,
    headline,
    script: combined,
    visualCaption: mainKeyword,
    visualConcept: `Design this slide around ${visualMetaphor}. Treat “${mainKeyword}” as the dominant visual anchor and “${secondaryKeyword}” as the supporting detail.`,
    composition: getComposition(index, settings.platform),
    palette: system.palette,
    typography: system.type,
    imagery: `Use ${system.texture.toLowerCase()}. Add one clear focal image or illustration that immediately explains the phrase without needing extra text.`,
    motion: `${toneDirectives[settings.tone]} Animate in 3 layers: background atmosphere first, focal object second, short text accents last.`,
    editorNotes: `Format for ${settings.platform}. Keep safe margins generous, leave room for captions, and make the visual understandable in the first 1.5 seconds.`,
    assets: suggestAssets(mainKeyword, secondaryKeyword, settings.style),
  };
}

function chooseMetaphor(keyword, index) {
  const metaphors = [
    `a large symbolic ${keyword} emerging from shadow into a lit frame`,
    `a split-screen contrast showing the before-and-after state of ${keyword}`,
    `a central path, timeline, or staircase that turns ${keyword} into a journey`,
    `layered cards that stack evidence, emotion, and context around ${keyword}`,
    `a close-up human moment paired with abstract shapes representing ${keyword}`,
  ];
  return metaphors[index % metaphors.length];
}

function getComposition(index, platform) {
  const layouts = [
    `For ${platform}, place a huge headline in the top third, focal subject center, and a small proof/detail label near the lower edge.`,
    `For ${platform}, create a diagonal flow from upper-left to lower-right with the subject crossing the frame and text following the motion path.`,
    `For ${platform}, use a clean three-layer depth stack: atmospheric background, mid-ground visual metaphor, foreground caption blocks.`,
    `For ${platform}, divide the canvas into a bold image side and a typography side so the phrase reads instantly.`,
  ];
  return layouts[index % layouts.length];
}

function suggestAssets(mainKeyword, secondaryKeyword, style) {
  const base = [
    `Primary image/illustration for “${mainKeyword}”`,
    `Small supporting icon or label for “${secondaryKeyword}”`,
    "Background texture or gradient plate",
    "Caption-safe title block",
  ];

  if (style === "documentary") base.push("Archival photo frame or scanned-paper overlay");
  if (style === "bold") base.push("Sticker shapes, arrows, and high-energy accent bursts");
  if (style === "luxury") base.push("Soft spotlight overlay and subtle metallic divider lines");

  return base.join("; ");
}

function buildPlan(settings) {
  const sentences = splitSentences(settings.script);
  const groups = createGroups(sentences, settings.mode);
  const slides = groups.map((group, index) => buildSlide(group, index, groups.length, settings));

  return {
    createdAt: new Date().toISOString(),
    settings,
    sentenceCount: sentences.length,
    slideCount: slides.length,
    slides,
  };
}

function renderPlan(plan) {
  currentPlan = plan;
  slidesContainer.innerHTML = "";
  summary.classList.remove("empty-state");
  summary.innerHTML = `
    <h3>${plan.slideCount} slide${plan.slideCount === 1 ? "" : "s"} generated from ${plan.sentenceCount} sentence${plan.sentenceCount === 1 ? "" : "s"}.</h3>
    <p><strong>Planning mode:</strong> ${modeInput.options[modeInput.selectedIndex].text}. <strong>Designer direction:</strong> ${styleInput.options[styleInput.selectedIndex].text}, ${toneInput.value} tone, ${platformInput.value} format.</p>
  `;

  plan.slides.forEach((slide) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".slide-number").textContent = String(slide.number).padStart(2, "0");
    node.querySelector(".visual-caption").textContent = slide.visualCaption;
    node.querySelector(".scene-label").textContent = slide.scenePurpose;
    node.querySelector("h3").textContent = slide.headline;
    node.querySelector(".script-line").textContent = `“${slide.script}”`;

    const definitionList = node.querySelector("dl");
    const details = [
      ["Visual concept", slide.visualConcept],
      ["Composition", slide.composition],
      ["Palette", slide.palette],
      ["Typography", slide.typography],
      ["Imagery", slide.imagery],
      ["Motion cues", slide.motion],
      ["Editor notes", slide.editorNotes],
      ["Asset checklist", slide.assets],
    ];

    details.forEach(([term, description]) => {
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = term;
      dd.textContent = description;
      definitionList.append(dt, dd);
    });

    slidesContainer.append(node);
  });

  copyButton.disabled = false;
  downloadButton.disabled = false;
  printButton.disabled = false;
}

function planToMarkdown(plan) {
  return plan.slides
    .map(
      (slide) => `## Slide ${slide.number}: ${slide.headline}
Purpose: ${slide.scenePurpose}
Script: ${slide.script}
Visual concept: ${slide.visualConcept}
Composition: ${slide.composition}
Palette: ${slide.palette}
Typography: ${slide.typography}
Imagery: ${slide.imagery}
Motion cues: ${slide.motion}
Editor notes: ${slide.editorNotes}
Asset checklist: ${slide.assets}`,
    )
    .join("\n\n");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const settings = {
    about: aboutInput.value.trim() || "A video that needs clear, memorable visuals",
    script: scriptInput.value.trim(),
    mode: modeInput.value,
    style: styleInput.value,
    platform: platformInput.value,
    tone: toneInput.value,
  };

  if (!settings.script) {
    scriptInput.focus();
    return;
  }

  renderPlan(buildPlan(settings));
});

copyButton.addEventListener("click", async () => {
  if (!currentPlan) return;
  await navigator.clipboard.writeText(planToMarkdown(currentPlan));
  copyButton.textContent = "Copied";
  setTimeout(() => {
    copyButton.textContent = "Copy brief";
  }, 1400);
});

downloadButton.addEventListener("click", () => {
  if (!currentPlan) return;
  const blob = new Blob([JSON.stringify(currentPlan, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "visual-slide-plan.json";
  anchor.click();
  URL.revokeObjectURL(url);
});

printButton.addEventListener("click", () => window.print());

exampleButton.addEventListener("click", () => {
  aboutInput.value =
    "A 45-second motivational video for creators who feel stuck after a failed launch. The video should feel cinematic, practical, and hopeful.";
  scriptInput.value =
    "Failure is not proof that you should stop. It is feedback showing you where the design needs to change. Step back and look at what people ignored, what they loved, and what confused them. Then rebuild one piece at a time. The next version does not need to be perfect. It only needs to be clearer than the last one.";
  modeInput.value = "three-scenes";
  styleInput.value = "cinematic";
  platformInput.value = "9:16";
  toneInput.value = "inspiring";
});

copyButton.disabled = true;
downloadButton.disabled = true;
printButton.disabled = true;
