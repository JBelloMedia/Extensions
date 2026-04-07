const generateBtn = document.getElementById('generateBtn');
const demoBtn = document.getElementById('demoBtn');
const scriptInput = document.getElementById('scriptInput');
const topicInput = document.getElementById('videoTopic');
const wordLimitInput = document.getElementById('sceneWordLimit');
const summaryEl = document.getElementById('summary');
const slidesContainer = document.getElementById('slidesContainer');
const template = document.getElementById('slideCardTemplate');

const demoContent = {
  topic:
    'A short promo video for freelancers who waste time switching between tools and want a simpler workflow.',
  script:
    'Every day, creators lose hours jumping between apps. What if planning, writing, and visual direction lived in one place? In this video, we show a faster creative system. You start with a rough script and instantly get scene-ready visual plans. Then you animate with confidence because every scene already has a clear design direction.',
};

const visualStyles = [
  {
    tone: 'Cinematic',
    palette: 'deep navy, amber highlights, soft haze',
    typography: 'high-contrast bold sans with cinematic subheads',
    motion: 'slow parallax drift + 12-frame whip transition',
  },
  {
    tone: 'Modern Minimal',
    palette: 'off-white canvas, charcoal text, one electric accent',
    typography: 'clean geometric sans with generous spacing',
    motion: 'shape reveals, masked wipes, subtle scale-in',
  },
  {
    tone: 'Energetic Social',
    palette: 'vibrant gradients, coral/purple pops, strong shadows',
    typography: 'thick display font + compact supporting captions',
    motion: 'quick cuts, bounce easing, sticker-style overlays',
  },
];

generateBtn.addEventListener('click', () => {
  generateFromCurrentInput();
});

demoBtn.addEventListener('click', () => {
  topicInput.value = demoContent.topic;
  scriptInput.value = demoContent.script;
  document.querySelector('input[name="mode"][value="phrases"]').checked = true;
  wordLimitInput.value = 24;
  generateFromCurrentInput();
});

function generateFromCurrentInput() {
  const script = scriptInput.value.trim();
  const topic = topicInput.value.trim();
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const sceneWordLimit = Number(wordLimitInput.value) || 28;

  if (!script) {
    renderEmpty('Add a script to generate slide direction.');
    return;
  }

  const scenes = mode === 'sentence' ? splitBySentence(script) : groupRelatedPhrases(script, sceneWordLimit);

  if (scenes.length === 0) {
    renderEmpty('Could not parse scenes from this script. Try cleaner punctuation.');
    return;
  }

  renderSlides({ scenes, topic, mode });
}

function splitBySentence(script) {
  return script
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function groupRelatedPhrases(script, maxWords = 28) {
  const parts = script
    .split(/(?<=[.!?])\s+|,\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const grouped = [];
  let current = [];
  let wordCount = 0;

  for (const part of parts) {
    const count = part.split(/\s+/).length;
    if (wordCount + count > maxWords && current.length) {
      grouped.push(current.join(' '));
      current = [part];
      wordCount = count;
    } else {
      current.push(part);
      wordCount += count;
    }
  }

  if (current.length) grouped.push(current.join(' '));
  return grouped;
}

function renderSlides({ scenes, topic, mode }) {
  slidesContainer.innerHTML = '';
  summaryEl.innerHTML = `Generated <strong>${scenes.length}</strong> scene block(s) in <strong>${mode}</strong> mode.
    <span class="badge">3 design options per scene</span>`;

  scenes.forEach((sceneText, index) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector('.slide-card');
    const title = node.querySelector('h3');
    const copy = node.querySelector('.scene-copy');
    const list = node.querySelector('.variation-list');

    title.textContent = `Scene ${index + 1}`;
    copy.textContent = `Script focus: "${sceneText}"`;

    const options = buildSceneVariations(sceneText, topic || 'General audience video');
    options.forEach((opt, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>Slide Option ${i + 1} — ${opt.tone}</strong><br>
        <strong>Layout:</strong> ${opt.layout}<br>
        <strong>Visual direction:</strong> ${opt.visuals}<br>
        <strong>Text hierarchy:</strong> ${opt.text}<br>
        <strong>Animation handoff:</strong> ${opt.animation}`;
      list.appendChild(li);
    });

    slidesContainer.appendChild(card);
  });
}

function buildSceneVariations(sceneText, topic) {
  return visualStyles.map((style) => {
    const anchorPhrase = extractAnchorPhrase(sceneText);

    return {
      tone: style.tone,
      layout: `Use a 3-layer composition: background environment, focal subject tied to "${anchorPhrase}", and top text rail. Reserve lower-right for callout icons related to ${topic}.`,
      visuals: `Palette: ${style.palette}. Add one symbolic visual metaphor for this scene. Keep strong depth separation and foreground cutouts for easy motion in Premiere/After Effects/CapCut.`,
      text: `Headline = emotional takeaway of this line. Subheadline = supporting fact. On-screen keywords should appear as staggered labels. Typography style: ${style.typography}.`,
      animation: `Apply ${style.motion}. Start with establishing frame (0-1s), reveal emphasis words (1-3s), then transition with directional movement aligned to next scene.`,
    };
  });
}

function extractAnchorPhrase(text) {
  const words = text.replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length <= 8) return words.join(' ');
  return words.slice(0, 8).join(' ') + '...';
}

function renderEmpty(msg) {
  summaryEl.textContent = msg;
  slidesContainer.innerHTML = '';
}
