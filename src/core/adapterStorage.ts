import { LMAdapter } from "../schema/LMAdapter";

export async function storeLMAdapters(adapters: LMAdapter[]): Promise<void> {
  await chrome.storage.sync.set({ adapters });
}

export async function retrieveLMAdapters(): Promise<LMAdapter[]> {
  const { adapters } = await chrome.storage.sync.get("adapters");
  return adapters || [];
}

export async function retrieveLMAdapter(
  provider: string,
): Promise<LMAdapter | undefined> {
  const adapters = await retrieveLMAdapters();
  return adapters.find((adapter) => adapter.provider === provider);
}

export function addLMAdaptersChangeListener(
  callback: (adapters: LMAdapter[]) => void,
): void {
  chrome.storage.sync.onChanged.addListener((changes) => {
    if (changes.adapters) {
      callback(changes.adapters.newValue);
    }
  });
}
