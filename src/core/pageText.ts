export const extractPageContent = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length < 0 || !tabs[0].id) {
    throw "No active tab found!";
  }
  const injectionResults = await chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: () => document.body.innerText,
  });
  if (!injectionResults || injectionResults.length === 0) {
    throw "No results from script injection!";
  }
  const pageContent = injectionResults[0].result;
  if (!pageContent) {
    throw "Unable to retrieve page content!";
  }
  return pageContent;
};
