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
      cardElement.className = "card";
      if (card.in_progress) {
        cardElement.innerHTML = `
                <p aria-busy="true">Card is being generated...</p>
          `;
      } else {
        cardElement.innerHTML = `
              ${card.front}
              <footer>${card.back}</footer>
          `;
      }
      gridContainer.appendChild(cardElement);
    });

    storedContentDiv.appendChild(gridContainer);
  } else {
    storedContentDiv.innerHTML = "<p>No cards created yet.</p>";
  }
  console.log("Cards rerendered");
}
