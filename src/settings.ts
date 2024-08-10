import { LMAdapter } from "./schema/LMAdapter";
import {
  storeLMAdapters,
  retrieveLMAdapters,
  addLMAdaptersChangeListener,
} from "./core/adapterStorage";

// Function to update and store all adapters
async function updateAndStoreAdapters() {
  const modelSelect = document.getElementById(
    "modelSelect",
  ) as HTMLSelectElement;
  const ollamaUrl = document.getElementById("ollamaUrl") as HTMLInputElement;
  const openaiKey = document.getElementById("openaiKey") as HTMLInputElement;

  const selectedModel = modelSelect.value;

  const adapters: LMAdapter[] = [
    {
      provider: "ollama",
      name: "Ollama",
      url: ollamaUrl.value || "http://localhost:11434",
      is_selected: selectedModel === "ollama",
    },
    {
      provider: "openai",
      name: "OpenAI",
      url: "https://api.openai.com/v1",
      apiKey: openaiKey.value,
      is_selected: selectedModel === "openai",
    },
  ];

  // Store adapters using the new function
  await storeLMAdapters(adapters);

  // Log adapters to console (without showing the full API key)
  console.log(
    "Updated Adapters:",
    adapters.map((adapter) => ({
      ...adapter,
      apiKey: adapter.apiKey ? `${adapter.apiKey.slice(0, 4)}...` : undefined,
    })),
  );
}

// Function to load and display stored adapters
async function loadStoredAdapters() {
  const adapters = await retrieveLMAdapters();
  if (adapters.length > 0) {
    const modelSelect = document.getElementById(
      "modelSelect",
    ) as HTMLSelectElement;
    const ollamaUrl = document.getElementById("ollamaUrl") as HTMLInputElement;
    const openaiKey = document.getElementById("openaiKey") as HTMLInputElement;

    adapters.forEach((adapter: LMAdapter) => {
      if (adapter.is_selected) {
        modelSelect.value = adapter.provider;
      }
      if (adapter.provider === "ollama") {
        ollamaUrl.value = adapter.url;
      }
      if (adapter.provider === "openai" && adapter.apiKey) {
        openaiKey.value = adapter.apiKey;
      }
    });
  }
}

// Add event listeners to all fields
function addListeners() {
  const fields = ["modelSelect", "ollamaUrl", "openaiKey"];
  fields.forEach((fieldId) => {
    document
      .getElementById(fieldId)
      ?.addEventListener("change", updateAndStoreAdapters);
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  loadStoredAdapters();
  addListeners();
});

// Use the new function to listen for changes
addLMAdaptersChangeListener(() => {
  loadStoredAdapters();
});
