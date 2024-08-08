export const retrieve_model = async (): Promise<string> => {
  return (await chrome.storage.sync.get(["model"])).model || "none";
};

export const store_model = async (model: string) => {
  await chrome.storage.sync.set({ model: model });
};
