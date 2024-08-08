import { generate_card } from "./core/generate_card";

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === "generate_card") {
    generate_card();
  }
});
