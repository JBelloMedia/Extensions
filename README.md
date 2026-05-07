# Visual Slide Planner

Visual Slide Planner is a browser-based planning tool for video editors, animators, and creators. Paste a voiceover script, add a short explanation of the video, and the app generates designer-style slide briefs that describe how each scene should look and move.

## What it does

- Turns a voiceover script into visual planning slides.
- Offers three planning modes:
  - **Three core scene slides** for a simple beginning/middle/end storyboard.
  - **Related phrases as one slide** for grouped beats and scenes.
  - **Every sentence as a separate slide** for detailed editing plans.
- Produces scene direction for visual concept, composition, palette, typography, imagery, motion cues, editor notes, and asset checklists.
- Supports common formats such as vertical 9:16, widescreen 16:9, square 1:1, and feed 4:5.
- Allows copying the brief, downloading JSON, and printing the slide plan.

## Run locally

This app has no build step and no external runtime dependencies beyond a local static server.

```bash
npm start
```

Then open <http://localhost:4173>.

## Check syntax

```bash
npm run check
```
