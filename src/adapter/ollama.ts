import { retrieve_html } from "../core/retrieve_html";

export const setup_ollama_stream = async () => {
  const pageContent = await retrieve_html();
  if (!pageContent) {
    console.error("Will not send to ollama with no page content");
    return null;
  }
  const prompt = generatePrompt(pageContent);
  console.log("sending request to ollama...");
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemma:2b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true,
    }),
  });

  if (!response.body) {
    console.error("No response body from Ollama");
    return null;
  }

  console.log("response body from Ollama received");
  return response.body;
};

const generatePrompt = (pageContent: string) => `
Help me generate flashcards for a test. This is the format. Pick up where I left off. Make sure to use the divider as well. Follow the form of:

**Question** Write a question here* *Answer** Here's the answer to the question
---
**Question** What is the fundamental principle of machine learning, and how does it relate to AI development? **Answer** The fundamental principle of machine learning is the ability of algorithms to learn from and improve through experience with data, without being explicitly programmed. This involves training models on large datasets, allowing them to recognize patterns and make predictions or decisions based on new, unseen data. Importantly, this principle underlies much of modern AI development, enabling systems to adapt to complex tasks and environments in ways that traditional, rule-based programming cannot easily achieve.
---`;
// const generatePrompt = (pageContent: string) =>
//   `As an AI assistant specializing in creating high-value flashcards for lifelong learners, your task is to analyze the given webpage content and create one exceptional flashcard. This flashcard should encapsulate a key concept, relationship, or insight that promotes deep understanding and critical thinking.

//   WEBPAGE CONTENT:
//   \`\`\`html
//   ${pageContent}
//   \`\`\`

//   INSTRUCTIONS:
//   1. Carefully analyze the webpage content, identifying the most impactful or thought-provoking concept.
//   2. Formulate a clear, concise question that:
//      a) Encourages critical thinking or application of knowledge
//      b) Relates to real-world scenarios or interdisciplinary connections
//      c) Targets higher-order thinking skills (e.g., analysis, synthesis, evaluation)
//   3. Craft a comprehensive answer that:
//      a) Provides a clear, concise explanation
//      b) Includes relevant details or examples
//      c) Potentially offers a broader context or implications

//   FORMAT:
//   Use the following format precisely, ensuring a clear separation between question and answer:

//   [QUESTION]
//   What is the key concept or insight regarding [topic] as discussed in the content?
//   ===
//   [ANSWER]
//   The key concept is [concise statement of the concept]. This involves [brief explanation of 2-3 sentences]. Importantly, [highlight a crucial implication or application].
//   ---

//   Now, create one high-value flashcard based on the provided webpage content. Ensure it promotes deep understanding and critical thinking, suitable for dedicated lifelong learners.`;
