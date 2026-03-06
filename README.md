# LinkedIn AI Reply Assistant (Chrome Extension)

A Manifest V3 Chrome extension that suggests AI-generated replies when you're focused in a LinkedIn comment editor.

## Features
- Adds a **Suggest reply** button near LinkedIn comment/post input boxes.
- Reads nearby post and visible comment context from the current feed item.
- Generates multiple draft suggestions with configurable tone, length, and count.
- Lets you click a suggestion to insert it into the active editor.

## Setup
1. Go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this folder.
4. Open the extension popup (or options page), add your OpenAI API key, and save.

## Usage
1. Open LinkedIn and go to a post.
2. Click into a comment box.
3. Click **Suggest reply**.
4. Pick one of the suggested drafts.

## Notes
- This extension currently targets `linkedin.com` DOM structures and may need updates if LinkedIn UI changes.
- Your API key is stored in `chrome.storage.sync` for convenience.
