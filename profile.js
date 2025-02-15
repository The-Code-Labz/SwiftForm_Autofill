document.addEventListener('DOMContentLoaded', function() {
  const profileForm = document.getElementById('profileForm');

  // Function to populate the form with profile data
  function populateForm(profile) {
    document.getElementById('profileName').value = profile.profileName || '';
    document.getElementById('fullName').value = profile.fullName || '';
    document.getElementById('emailAddress').value = profile.emailAddress || '';
    document.getElementById('phoneNumber').value = profile.phoneNumber || '';
    document.getElementById('address').value = profile.address || '';
    document.getElementById('address2').value = profile.address2 || '';
    document.getElementById('city').value = profile.city || '';
    document.getElementById('state').value = profile.state || '';
    document.getElementById('zip').value = profile.zip || '';
    document.getElementById('country').value = profile.country || '';
    document.getElementById('ssn').value = profile.ssn || '';
    document.getElementById('username').value = profile.username || '';
    document.getElementById('password').value = profile.password || '';
    document.getElementById('note').value = profile.note || '';
    document.getElementById('folder').value = profile.folder || '';
  }

  // Check if we are in edit mode
  const urlParams = new URLSearchParams(window.location.search);
  const editMode = urlParams.get('edit') === 'true';

  if (editMode) {
    chrome.storage.sync.get(['profiles', 'editIndex'], function(data) {
      const profiles = data.profiles || [];
      const editIndex = data.editIndex;

      if (editIndex !== undefined && profiles[editIndex]) {
        populateForm(profiles[editIndex]);
      }
    });
  }

  profileForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const profile = {
      profileName: document.getElementById('profileName').value,
      fullName: document.getElementById('fullName').value,
      emailAddress: document.getElementById('emailAddress').value,
      phoneNumber: document.getElementById('phoneNumber').value,
      address: document.getElementById('address').value,
      address2: document.getElementById('address2').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zip: document.getElementById('zip').value,
      country: document.getElementById('country').value,
      ssn: document.getElementById('ssn').value,
      username: document.getElementById('username').value,
      password: document.getElementById('password').value,
      note: document.getElementById('note').value,
      folder: document.getElementById('folder').value
    };

    chrome.storage.sync.get(['profiles', 'editIndex'], function(data) {
      let profiles = data.profiles || [];
      const editIndex = data.editIndex;

      if (editMode && editIndex !== undefined && profiles[editIndex]) {
        // Update existing profile
        profiles[editIndex] = profile;
      } else {
        // Add new profile
        profiles.push(profile);
      }

      chrome.storage.sync.set({ 'profiles': profiles }, function() {
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
