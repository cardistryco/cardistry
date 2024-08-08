import { render_model } from "./component/render_model";
import { store_model } from "./core/access_saved_model";

console.log("settings.js loaded");

document
  .getElementById("modelSelect")
  ?.addEventListener(
    "change",
    async (event) =>
      await store_model((event.target as HTMLSelectElement).value),
  );

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync") {
    if (changes.model) {
      render_model();
    }
  }
});

document.addEventListener("DOMContentLoaded", render_model);
