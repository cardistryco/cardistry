import { addCard, updateCard } from "./core/cardStorage";
import { retrieve_html } from "./core/retrieve_html";

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === "generate_card") {
    const card = create_new_card();
    await addCard(card);
    const html_content = await retrieve_html();
    const { front, back } = await generate_card_content(html_content);
    const contentfulCard = { ...card, front, back, isFinished: false };
    await updateCard(contentfulCard.id, contentfulCard);
  }
});

const create_new_card = () => ({
  id: Date.now(),
  isFinished: false,
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
  Help me generate a single flashcard based on the below content.

  <start_page_content>
  ${pageContent}
  <end_page_content>`;

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
