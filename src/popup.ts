import {
  addCardsListener,
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
    storedContentDiv.innerHTML = ""; // Clear existing content
    const gridContainer = document.createElement("div");
    gridContainer.className = "grid";
    cards.forEach((card: Card) => {
      const cardElement = document.createElement("article");
      cardElement.className = "flashcard";
      cardElement.style.position = "relative";
      cardElement.style.display = "flex";
      cardElement.style.overflow = "hidden";
      cardElement.style.flexDirection = "column";
      cardElement.style.height = "100%"; // Ensure the card takes full height

      if (!card.isFinished) {
        cardElement.innerHTML = `
          <p aria-busy="true">Card is being generated...</p>
        `;
      } else {
        cardElement.innerHTML = `
          <div class="card-content" style="display: flex; flex-direction: column; height: 100%; padding-right: 3rem;">
            <div class="front" style="flex: 1; padding: var(--pico-spacing); background-color: var(--pico-card-background-color);">
              ${card.front}
            </div>
            <div class="back" style="flex: 1; padding: var(--pico-spacing); background-color: var(--pico-card-sectioning-background-color);">
              ${card.back}
            </div>
          </div>
          <nav class="card-nav" style="position: absolute; right: 0; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; width: 3rem; background-color: var(--pico-card-border-color); border-left: var(--pico-border-width) solid var(--pico-card-border-color);">
            <a href="#" class="secondary" data-tooltip="Delete" onclick="deleteCard(${card.id})" style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; margin: 0.5rem auto; border-radius: 50%; transition: background-color var(--pico-transition);color: #3A70B0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </a>
            <a href="#" class="secondary" data-tooltip="Export" onclick="exportCard(${card.id})" style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; margin: 0.5rem auto; border-radius: 50%; transition: background-color var(--pico-transition); color: #3A70B0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </a>
          </nav>
        `;
      }
      gridContainer.appendChild(cardElement);
    });
    storedContentDiv.appendChild(gridContainer);

    // Add hover effect for nav buttons
    const style = document.createElement("style");
    style.textContent = `
      .card-nav a:hover {
        background-color: var(--pico-card-background-color);
      }
    `;
    document.head.appendChild(style);
  } else {
    storedContentDiv.innerHTML = "<p>No cards created yet.</p>";
  }
  console.log("Cards rerendered");
}

// Add these functions to handle delete and export actions
function deleteCard(cardId) {
  // Implement delete functionality
  console.log(`Delete card with ID: ${cardId}`);
}

function exportCard(cardId) {
  // Implement export functionality
  console.log(`Export card with ID: ${cardId}`);
}
