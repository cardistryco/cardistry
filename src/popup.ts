import {
  addCardsListener,
  deleteCard,
  retrieveCards,
  storeCards,
} from "./core/cardStorage";
import { Card } from "./schema/Card";

document
  .getElementById("generateButton")
  ?.addEventListener("click", () =>
    chrome.runtime.sendMessage({ action: "generate_card" }),
  );

document
  .getElementById("clearButton")
  ?.addEventListener("click", () => storeCards([]));

addCardsListener(render_cards);

// Initial update of stored content when popup opens
document.addEventListener("DOMContentLoaded", render_cards);

async function render_cards() {
  const cards = await retrieveCards();
  const storedContentDiv = document.getElementById("storedContent");
  if (!storedContentDiv) {
    console.error("was unable to find the storedContent id in the DOM");
    return;
  }
  if (cards && cards.length > 0) {
    storedContentDiv.innerHTML = "";
    const gridContainer = document.createElement("div");
    gridContainer.className = "grid";
    cards.forEach((card: Card) => {
      const cardElement = document.createElement("article");
      cardElement.className = "flashcard";
      cardElement.style.position = "relative";
      cardElement.style.display = "flex";
      cardElement.style.overflow = "hidden";
      cardElement.style.flexDirection = "column";
      cardElement.style.height = "100%";

      if (!card.isFinished) {
        cardElement.innerHTML = `
          <p aria-busy="true">Card is being generated...</p>
        `;
      } else {
        cardElement.innerHTML = `
          <div class="card-content" style="display: flex; flex-direction: column; height: 100%; padding-right: 3rem;">
            <div class="front" style="flex: 1; padding: var(--pico-spacing); background-color: var(--pico-card-background-color); position: relative;">
              <div class="container" style="display: grid; grid-template-columns: 4fr 1fr; grid-template-rows: 1fr; grid-column-gap: 20px; grid-row-gap: 20px; justify-items: stretch; align-items: stretch; height: 100%;">
                <div class="content" style="overflow-y: auto;">${card.front}</div>
                <div style="display: flex; justify-content: center; align-items: center;">
                  <button class="copy-btn" data-content="front" style="background: none; border: none; cursor: pointer; color: #3A70B0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="back" style="flex: 1; padding: var(--pico-spacing); background-color: var(--pico-card-sectioning-background-color); position: relative;">
              <div class="container" style="display: grid; grid-template-columns: 4fr 1fr; grid-template-rows: 1fr; grid-column-gap: 20px; grid-row-gap: 20px; justify-items: stretch; align-items: stretch; height: 100%;">
                <div class="content" style="overflow-y: auto;">${card.back}</div>
                <div style="display: flex; justify-content: center; align-items: center;">
                  <button class="copy-btn" data-content="back" style="background: none; border: none; cursor: pointer; color: #3A70B0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <nav class="card-nav" style="position: absolute; right: 0; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; width: 3rem; background-color: var(--pico-card-border-color); border-left: var(--pico-border-width) solid var(--pico-card-border-color);">
            <a href="#" class="secondary delete-card" data-card-id="${card.id}" data-tooltip="Delete" style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; margin: 0.5rem auto; border-radius: 50%; transition: background-color var(--pico-transition); color: #3A70B0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </a>
            <a href="#" class="secondary export-card" data-card-id="${card.id}" data-tooltip="Export" style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; margin: 0.5rem auto; border-radius: 50%; transition: background-color var(--pico-transition); color: #3A70B0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </a>
          </nav>
        `;

        // Add event listeners for delete and export buttons
        const deleteButton = cardElement.querySelector(".delete-card");
        deleteButton?.addEventListener("click", (e) => {
          e.preventDefault();
          const cardId = (e.currentTarget as HTMLElement).dataset.cardId;
          if (cardId) deleteCard(parseInt(cardId, 10));
        });

        const exportButton = cardElement.querySelector(".export-card");
        exportButton?.addEventListener("click", (e) => {
          e.preventDefault();
          const cardId = (e.currentTarget as HTMLElement).dataset.cardId;
          if (cardId) exportCard(parseInt(cardId, 10));
        });

        // Add event listeners for copy buttons
        const copyButtons = cardElement.querySelectorAll(".copy-btn");
        copyButtons.forEach((button) => {
          button.addEventListener("click", (e) => {
            e.preventDefault();
            const contentType = (e.currentTarget as HTMLElement).dataset
              .content;
            const content = contentType === "front" ? card.front : card.back;
            copyToClipboard(content);
          });
        });
      }
      gridContainer.appendChild(cardElement);
    });
    storedContentDiv.appendChild(gridContainer);

    // Add hover effect for nav buttons and copy buttons
    const style = document.createElement("style");
    style.textContent = `
      .card-nav a:hover, .copy-btn:hover {
        background-color: var(--pico-card-background-color);
      }
      .copy-btn {
        opacity: 0.7;
        transition: opacity 0.2s ease-in-out;
      }
      .copy-btn:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  } else {
    storedContentDiv.innerHTML = "<p>No cards created yet.</p>";
  }
  console.log("Cards rerendered");
}

function exportCard(cardId: number) {
  // Implement export functionality
  console.log(`Export card with ID: ${cardId} (Functionality is TODO)`);
}

function copyToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("Content copied to clipboard");
      // Optionally, you can show a temporary notification to the user
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
}
