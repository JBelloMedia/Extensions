const BUTTON_CLASS = "liai-suggest-btn";
const PANEL_CLASS = "liai-panel";
let currentEditor = null;

document.addEventListener("focusin", (event) => {
  const editor = findLinkedInEditor(event.target);
  if (!editor) {
    return;
  }

  currentEditor = editor;
  injectSuggestButton(editor);
});

function findLinkedInEditor(target) {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  if (target.matches('[contenteditable="true"]')) {
    return target;
  }

  return target.closest('[contenteditable="true"]');
}

function injectSuggestButton(editor) {
  if (!(editor instanceof HTMLElement)) {
    return;
  }

  const wrapper = editor.closest("form, .comments-comment-box, .editor-content") || editor.parentElement;
  if (!wrapper || wrapper.querySelector(`.${BUTTON_CLASS}`)) {
    return;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = BUTTON_CLASS;
  button.textContent = "Suggest reply";

  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "Thinking…";

    try {
      const payload = collectContext(editor);
      const result = await chrome.runtime.sendMessage({
        type: "GENERATE_SUGGESTIONS",
        payload
      });

      if (!result?.ok) {
        throw new Error(result?.error || "No suggestion returned.");
      }

      showSuggestions(editor, result.suggestions || []);
    } catch (error) {
      showSuggestions(editor, [`Error: ${error.message}`], true);
    } finally {
      button.disabled = false;
      button.textContent = "Suggest reply";
    }
  });

  wrapper.appendChild(button);
}

function collectContext(editor) {
  const postContainer = editor.closest(
    ".feed-shared-update-v2, .scaffold-finite-scroll__content, .comments-comment-item"
  );

  const postText =
    postContainer?.querySelector('.feed-shared-inline-show-more-text, [data-test-id="main-feed-activity-card"]')
      ?.innerText?.trim() ||
    postContainer?.innerText?.split("Like\nComment\nRepost")?.[0]?.trim() ||
    "";

  const commentNodes = postContainer
    ? [...postContainer.querySelectorAll(".comments-comment-item, .comments-comment-item__main-content")]
    : [];

  const visibleComments = commentNodes
    .slice(0, 5)
    .map((node) => node.innerText?.trim())
    .filter(Boolean)
    .join("\n---\n");

  const contextType = editor.closest(".comments-comment-box") ? "comment" : "post";

  return {
    postText,
    visibleComments,
    contextType
  };
}

function showSuggestions(editor, suggestions, isError = false) {
  const existing = editor.parentElement?.querySelector(`.${PANEL_CLASS}`);
  if (existing) {
    existing.remove();
  }

  const panel = document.createElement("div");
  panel.className = PANEL_CLASS;

  suggestions.forEach((suggestion, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "liai-suggestion-item";
    item.textContent = suggestion;
    item.disabled = isError;

    item.addEventListener("click", () => {
      applySuggestion(editor, suggestion);
      panel.remove();
    });

    item.setAttribute("aria-label", `Suggestion ${index + 1}`);
    panel.appendChild(item);
  });

  editor.parentElement?.appendChild(panel);
}

function applySuggestion(editor, text) {
  editor.focus();
  editor.innerText = text;
  editor.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
}
