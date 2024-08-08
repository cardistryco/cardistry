import { retrieve_model } from "../core/access_saved_model";

export const render_model = async () => {
  const model = await retrieve_model();
  (document.getElementById("modelSelect") as HTMLSelectElement).value = model;
};
