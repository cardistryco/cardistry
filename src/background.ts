import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { retrieveLMAdapter } from "./core/adapterStorage";
import { addCard, updateCard } from "./core/cardStorage";
import { extractPageContent } from "./core/pageText";
import { z } from "zod";

chrome.runtime.onMessage.addListener(async (message) => {
  console.log("Received message in background script:", message);
  if (message.action === "generate_card") {
    console.log("Generating new card");
    const card = generateNewCard();
    await addCard(card);
    console.log("New card added:", card);
    const html_content = await extractPageContent();
    console.log("Retrieved HTML content, length:", html_content.length);
    const { front, back } = await generateCardContent(html_content);
    const contentfulCard = { ...card, front, back, isFinished: true };
    console.log(`contenfulCard: ${contentfulCard}`);
    await updateCard(contentfulCard.id, contentfulCard);
    console.log("Updated card with content:", contentfulCard);
  }
});

const generateNewCard = () => ({
  id: Date.now(),
  isFinished: false,
  front: "",
  back: "",
});

const generateCardContent = async (html: string) => {
  const adapter = await retrieveLMAdapter();
  console.log(`selected adapter: ${JSON.stringify(adapter)}`);
  if (adapter && adapter.provider === "ollama") {
    console.log("generating ollama request");
    const request = getOllamaRequest(html);
    console.log("reaching out to ollama...");
    const response = await fetch(`${adapter.url}/api/chat`, request);
    console.log(`ollama response: ${response}`);
    const { message } = await response.json();
    const [front, back] = parseContent(message.content);
    return { front, back };
  }
  if (adapter && adapter.provider === "openai" && adapter.apiKey) {
    const openai = new OpenAI({ apiKey: adapter.apiKey });
    const CardContent = z.object({
      front: z.string(),
      back: z.string(),
    });
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: "Generate an enriching flashcard from the content below.",
        },
        {
          role: "user",
          content: html,
        },
      ],
      response_format: zodResponseFormat(CardContent, "card"),
    });

    const content = completion.choices[0].message.parsed;
    if (!content) throw new Error("did not receive content from openai");
    return content;
  }
  return {
    front: "please select an adapter and make sure api key is set",
    back: "",
  };
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

export const getOpenAIRequest = (html: string, apiKey: string) => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that creates flashcards based on provided content.",
      },
      {
        role: "user",
        content: generatePrompt(html),
      },
    ],
    temperature: 0.7,
    max_tokens: 150, // Adjust this value based on your needs
    n: 1,
    stream: false,
  }),
});

const generatePrompt = (pageContent: string) => `
  Help me generate a single flashcard based on the below content.

  <start_page_content>
  ${pageContent}
  <end_page_content>`;

const parseContent = (content: string): [string, string] => {
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
