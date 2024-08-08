export const retrieve_html = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length < 0 || !tabs[0].id) {
    console.error("No active tab found!");
    return;
  }
  console.log("about to get innerText");
  const injectionResults = await chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: () => document.body.innerText,
  });
  console.log("script injection success");
  if (!injectionResults || injectionResults.length === 0) {
    console.error("No results from script injection!");
    return;
  }
  const pageContent = injectionResults[0].result;
  if (!pageContent) {
    console.error("Unable to retrieve page content!");
    return;
  }
  return pageContent;
};
