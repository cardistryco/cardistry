import { retrieve_model, store_model } from "./core/access_saved_model";

console.log("settings.js loaded");

document
  .getElementById("modelSelect")
  ?.addEventListener(
    "change",
    async (event) =>
      await store_model((event.target as HTMLSelectElement).value),
  );

chrome.storage.sync.onChanged.addListener((changes) => {
  if (changes.model) {
    render_model();
  }
});

document.addEventListener("DOMContentLoaded", render_model);

async function render_model() {
  const model = await retrieve_model();
  (document.getElementById("modelSelect") as HTMLSelectElement).value = model;
}
