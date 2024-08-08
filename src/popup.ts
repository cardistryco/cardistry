import { retrieve_flashcards } from "./core/access_saved_cards";
import { Flashcard } from "./schema/flashcard";

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

async function render_flashcards() {
  const flashcards = await retrieve_flashcards();
  const storedContentDiv = document.getElementById("storedContent");
  if (!storedContentDiv) {
    console.error("was unable to find the storedContent id in the DOM");
    return;
  }

  if (flashcards && flashcards.length > 0) {
    storedContentDiv.innerHTML = ""; // Clear existing content

    const gridContainer = document.createElement("div");
    gridContainer.className = "grid";

    flashcards.forEach((flashcard: Flashcard) => {
      const cardElement = document.createElement("article");
      cardElement.className = "card";
      if (flashcard.in_progress) {
        cardElement.innerHTML = `
                <p aria-busy="true">Card is being generated...</p>
          `;
      } else {
        cardElement.innerHTML = `
              ${flashcard.front}
              <footer>${flashcard.back}</footer>
          `;
      }
      gridContainer.appendChild(cardElement);
    });

    storedContentDiv.appendChild(gridContainer);
  } else {
    storedContentDiv.innerHTML = "<p>No flashcards stored yet.</p>";
  }
  console.log("Cards rerendered");
}
