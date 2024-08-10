import { Card } from "../schema/Card";

export async function storeCards(cards: Card[]): Promise<void> {
  await chrome.storage.sync.set({ cards });
}

export async function retrieveCards(): Promise<Card[]> {
  const { cards } = await chrome.storage.sync.get("cards");
  return cards || [];
}

export async function retrievCard(id: number): Promise<Card | undefined> {
  const cards = await retrieveCards();
  return cards.find((c) => c.id === id);
}

export async function updateCard(id: number, card: Card) {
  const cards = await retrieveCards();
  const idx = cards.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Flashcard with id ${id} not found`);
  cards[idx] = { ...cards[idx], ...card };
  await storeCards(cards);
}

export async function addCard(card: Card) {
  const cards = await retrieveCards();
  const idx = cards.findIndex((c) => c.id === card.id);
  if (idx !== -1)
    throw new Error(`Cannot add Card w/ id ${card.id} (already exists)`);
  cards.unshift(card);
  await storeCards(cards);
}

export function addCardsListener(callback: (cards: Card[]) => void) {
  chrome.storage.sync.onChanged.addListener((changes) => {
    if (changes.cards) {
      callback(changes.cards.newValue);
    }
  });
}
