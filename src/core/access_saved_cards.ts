import { Flashcard } from "../schema/flashcard";

export const retrieve_flashcards = async (): Promise<Flashcard[]> =>
  (await chrome.storage.sync.get(["flashcards"])).flashcards ||
  ([] as Flashcard[]);

export const store_flashcards = async (flashcards: Flashcard[]) => {
  await chrome.storage.sync.set({ flashcards: flashcards });
};

export const retrieve_flashcard = async (id: number): Promise<Flashcard> => {
  const flashcards = retrieve_flashcards();
  const flashcard = (await flashcards).find((fc) => fc.id === id);

  if (!flashcard) {
    console.error("unable to retrieve flashcard:", id);
    throw `Unable to retrieve flashcard: ${id}`;
  }
  return flashcard;
};

export const store_flashcard = async (flashcard: Flashcard) => {
  const flashcards = await retrieve_flashcards();
  const cardIndex = flashcards.findIndex((fc) => flashcard.id === fc.id);
  if (cardIndex === -1) {
    flashcards.unshift(flashcard);
    await store_flashcards(flashcards);
  } else {
    flashcards[cardIndex] = flashcard;
    await store_flashcards(flashcards);
  }
};
