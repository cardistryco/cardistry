import { store_flashcard } from "./core/access_saved_cards";
import { retrieve_html } from "./core/retrieve_html";

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === "generate_card") {
    const flashcard = create_new_card();
    await store_flashcard(flashcard);
    const html_content = await retrieve_html();
    const { front, back } = await generate_card_content(html_content);
    const card_with_content = { ...flashcard, front, back, in_progress: false };
    console.log("storing card...");
    await store_flashcard(card_with_content);
    console.log("store complete");
  }
});

const create_new_card = () => ({
  id: Date.now(),
  in_progress: true,
  front: "",
  back: "",
});

const generate_card_content = async (html: string) => {
  const request = getOllamaRequest(html);
  const response = await fetch("http://localhost:11434/api/chat", request);
  const { message } = await response.json();
  const [front, back] = parse_content(message.content);
  return { front, back };
};

export const getOllamaRequest = (html: string) => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gemma:2b",
    messages: [
      {
        role: "user",
        content: generatePrompt(html),
      },
    ],
    stream: false,
  }),
});

const generatePrompt = (pageContent: string) => `
Help me generate flashcards for a test. This is the format. Pick up where I left off. Make sure to use the divider as well. Follow the form of:

**Question** Write a question here* *Answer** Here's the answer to the question
---
**Question** What is the fundamental principle of machine learning, and how does it relate to AI development? **Answer** The fundamental principle of machine learning is the ability of algorithms to learn from and improve through experience with data, without being explicitly programmed. This involves training models on large datasets, allowing them to recognize patterns and make predictions or decisions based on new, unseen data. Importantly, this principle underlies much of modern AI development, enabling systems to adapt to complex tasks and environments in ways that traditional, rule-based programming cannot easily achieve.
---`;

const parse_content = (content: string): [string, string] => {
  // Find the indices of **Question** and **Answer**
  const questionStart = content.indexOf("**Question**");
  const answerStart = content.indexOf("**Answer**");

  if (questionStart === -1 || answerStart === -1) {
    // If we can't find both markers, return the whole content as the question
    console.log(`parse should be returning: ${[content.trim(), ""]}`);
    return [content.trim(), ""];
  }

  const questionContent = content
    .slice(questionStart + "**Question**".length, answerStart)
    .trim();

  const answerContent = content.slice(answerStart + "**Answer**".length).trim();

  return [questionContent, answerContent];
};
