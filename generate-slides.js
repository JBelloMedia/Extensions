#!/usr/bin/env node
const fs = require('fs');

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

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
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

function extractAnchorPhrase(text) {
  const words = text.replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length <= 8) return words.join(' ');
  return `${words.slice(0, 8).join(' ')}...`;
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

function usage() {
  console.log(`Usage:
  node generate-slides.js --topic "..." --script "..." [--mode sentence|phrases] [--max-words 28]
  node generate-slides.js --topic "..." --script-file ./script.txt [--mode sentence|phrases] [--max-words 28]

Options:
  --topic         Video topic / purpose
  --script        Script text (direct inline)
  --script-file   Path to a text file containing the script
  --mode          sentence (default) | phrases
  --max-words     Max words per grouped scene in phrases mode (default: 28)
  --help          Show this message`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    process.exit(0);
  }

  const topic = (args.topic || 'General audience video').trim();
  let script = '';

  if (args['script-file']) {
    script = fs.readFileSync(args['script-file'], 'utf8').trim();
  } else if (args.script) {
    script = args.script.trim();
  }

  if (!script) {
    console.error('Error: provide --script or --script-file');
    usage();
    process.exit(1);
  }

  const mode = args.mode === 'phrases' ? 'phrases' : 'sentence';
  const maxWords = Number(args['max-words']) || 28;
  const scenes = mode === 'sentence' ? splitBySentence(script) : groupRelatedPhrases(script, maxWords);

  console.log(`# Slide Plan\n`);
  console.log(`- Topic: ${topic}`);
  console.log(`- Mode: ${mode}`);
  console.log(`- Scene blocks: ${scenes.length}\n`);

  scenes.forEach((scene, index) => {
    console.log(`## Scene ${index + 1}`);
    console.log(`Script focus: "${scene}"\n`);
    const options = buildSceneVariations(scene, topic);
    options.forEach((opt, i) => {
      console.log(`### Slide Option ${i + 1} — ${opt.tone}`);
      console.log(`- Layout: ${opt.layout}`);
      console.log(`- Visual direction: ${opt.visuals}`);
      console.log(`- Text hierarchy: ${opt.text}`);
      console.log(`- Animation handoff: ${opt.animation}\n`);
    });
  });
}

main();
