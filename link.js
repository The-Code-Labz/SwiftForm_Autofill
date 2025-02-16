document.addEventListener('DOMContentLoaded', function() {
  const linkForm = document.getElementById('linkForm');

  // Function to populate the form with link data
  function populateForm(link) {
    document.getElementById('title').value = link.title || '';
    document.getElementById('url').value = link.url || '';
    document.getElementById('note').value = link.note || '';
  }

  // Check if we are in edit mode
  const urlParams = new URLSearchParams(window.location.search);
  const editMode = urlParams.get('edit') === 'true';

  if (editMode) {
    chrome.storage.sync.get(['links', 'editIndex'], function(data) {
      const links = data.links || [];
      const editIndex = data.editIndex;

      if (editIndex !== undefined && links[editIndex]) {
        populateForm(links[editIndex]);
      }
    });
  }

  linkForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const link = {
      title: document.getElementById('title').value,
      url: document.getElementById('url').value,
      note: document.getElementById('note').value
    };

    chrome.storage.sync.get(['links', 'editIndex'], function(data) {
      let links = data.links || [];
      const editIndex = data.editIndex;

      if (editMode && editIndex !== undefined && links[editIndex]) {
        // Update existing link
        links[editIndex] = link;
      } else {
        // Add new link
        links.push(link);
      }

      chrome.storage.sync.set({ 'links': links }, function() {
        // Clear the editIndex
        chrome.storage.sync.remove('editIndex');

        // Close the tab after saving
        chrome.tabs.getCurrent(function(tab) {
          chrome.tabs.remove(tab.id);
        });
      });
    });
  });

  // Cancel button functionality
  const cancelButton = document.querySelector('.cancel');
  cancelButton.addEventListener('click', function() {
    chrome.tabs.getCurrent(function(tab) {
      chrome.tabs.remove(tab.id);
    });
  });
});
