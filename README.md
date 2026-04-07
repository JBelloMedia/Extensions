# Storyboard Slide Designer

A lightweight single-page app that converts a video script/voiceover into scene-by-scene slide blueprints for visual planning.

## What it does

- Accepts:
  - Script / voiceover text
  - Video topic or creative intent
- Offers two segmentation options:
  - **Every sentence as a separate scene**
  - **Related phrases grouped into one scene**
- For each resulting scene, generates **3 different slide design options** with:
  - Layout structure
  - Visual style direction
  - Text hierarchy
  - Animation handoff notes for editors/animators
- Includes **Load Demo + Preview** to instantly populate sample content and render output.

## Use it directly in this ChatGPT coding environment

If you want to use it "in here" without opening a browser, run the CLI generator:

```bash
node generate-slides.js --topic "Your video topic" --script "Your script text" --mode phrases --max-words 24
```

Or with a script file:

```bash
node generate-slides.js --topic "Your video topic" --script-file ./script.txt --mode sentence
```

The CLI prints a full markdown slide plan in the terminal (scene by scene, 3 options each).

## Preview locally (browser)

Use the included preview server:

```bash
node preview-server.js
```

Then open: `http://localhost:4173`

## Run alternatives

Because this app is static HTML/CSS/JS, you can also open `index.html` directly in your browser, or run:

```bash
python -m http.server 8000
```

Then open: `http://localhost:8000`

## Workflow

1. Paste your voiceover script.
2. Add a brief explanation of your video's purpose and tone.
3. Choose segmentation mode.
4. Click **Generate Slide Plan** (or **Load Demo + Preview**).
5. Use scene cards as your visual design storyboard before animation/editing.
