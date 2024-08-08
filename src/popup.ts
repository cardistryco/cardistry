import { render_flashcards } from "./component/render_flashcards";

document
  .getElementById("generateButton")
  ?.addEventListener(
    "click",
    async () => await chrome.runtime.sendMessage({ action: "generate_card" }),
  );

document
  .getElementById("clearButton")
  ?.addEventListener(
    "click",
    async () => await chrome.storage.sync.set({ flashcards: [] }),
  );

chrome.storage.sync.onChanged.addListener((changes) => {
  if (changes.flashcards) {
    render_flashcards();
  }
});

// Initial update of stored content when popup opens
document.addEventListener("DOMContentLoaded", render_flashcards);
