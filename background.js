chrome.runtime.onInstalled.addListener(() => {
  // Initialize profiles as an empty array in storage
  chrome.storage.sync.get('profiles', (data) => {
    if (!data.profiles) {
      chrome.storage.sync.set({ profiles: [] });
    }
  });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Received message in background script:", request);

    if (request.message === "fillForm") {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs || tabs.length === 0) {
          console.error('No active tabs found.');
          return;
        }
        const activeTab = tabs[0];
        if (!activeTab || !activeTab.id) {
            console.error('Active tab has no ID.', activeTab);
            return;
        }
        const tabId = activeTab.id;
        console.log("Sending message to tab ID:", tabId);

        chrome.tabs.sendMessage(tabId, {message: "fillForm", profile: request.profile}, function(response) {
            if (chrome.runtime.lastError) {
                console.error("Error sending message to content script:", chrome.runtime.lastError.message);
            } else {
                console.log("Response from content script:", response);
            }
        });
      });
    }
  }
);
