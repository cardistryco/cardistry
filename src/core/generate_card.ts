import { setup_ollama_stream } from "../adapter/ollama";
import { Flashcard } from "../schema/flashcard";
import { store_flashcards, retrieve_flashcards } from "./access_saved_cards";

export const generate_card = async () => {
  const id = Date.now();
  await generate_base(id);
  await stream_content(id);
};

const generate_base = async (id: number) => {
  const newFlashcard: Flashcard = {
    id: id,
    createdAt: new Date().toISOString(),
    status: "CREATED",
  };
  const flashcards = await retrieve_flashcards();
  flashcards.unshift(newFlashcard);
  await store_flashcards(flashcards);
  console.log("flashcard added successfully.");
};

const stream_content = async (id: number) => {
  const stream = await setup_ollama_stream();
  if (!stream) {
    console.error("Failed to set up Ollama stream");
    return;
  }

  const reader = stream.getReader();
  let accumulatedContent = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = new TextDecoder().decode(value);
      const jsonData = JSON.parse(text);

      // Extract only the content from the message
      if (jsonData.message && jsonData.message.content) {
        accumulatedContent += jsonData.message.content;
      }
    }
  } catch (error) {
    console.error("Error processing stream:", error);
  } finally {
    reader.releaseLock();
  }

  // Final update to mark the flashcard as completed
  await finalize_flashcard(id, accumulatedContent);
};

const finalize_flashcard = async (id: number, content: string) => {
  const flashcards = await retrieve_flashcards();
  const cardIndex = flashcards.findIndex((flashcard) => flashcard.id === id);

  if (cardIndex === -1) {
    console.error("Flashcard not found with id:", id);
    return;
  }

  const [front, back] = parse_content(content);

  flashcards[cardIndex] = {
    ...flashcards[cardIndex],
    status: "COMPLETED",
    front: front,
    back: back,
  };

  await store_flashcards(flashcards);
};

const parse_content = (content: string): [string, string] => {
  // Find the indices of **Question** and **Answer**
  const questionStart = content.indexOf("**Question**");
  const answerStart = content.indexOf("**Answer**");

  if (questionStart === -1 || answerStart === -1) {
    // If we can't find both markers, return the whole content as the question
    console.log(`parse should be returning: ${[content.trim(), ""]}`);
    return [content.trim(), ""];
  }

  // Extract the question (everything between **Question** and **Answer**)
  const questionContent = content.slice(questionStart + 12, answerStart).trim();

  // Extract the answer (everything after **Answer**)
  const answerContent = content.slice(answerStart + 10).trim();

  return [questionContent, answerContent];
};
