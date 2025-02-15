document.addEventListener('DOMContentLoaded', function() {
  const profileForm = document.getElementById('profileForm');

  // Function to populate the form with profile data
  function populateForm(profile) {
    document.getElementById('firstName').value = profile.firstName || '';
    document.getElementById('middleName').value = profile.middleName || '';
    document.getElementById('lastName').value = profile.lastName || '';
    document.getElementById('phoneNumber').value = profile.phoneNumber || '';
    document.getElementById('address').value = profile.address || '';
    document.getElementById('city').value = profile.city || '';
    document.getElementById('state').value = profile.state || '';
    document.getElementById('zip').value = profile.zip || '';
    document.getElementById('dob').value = profile.dob || '';
    document.getElementById('ssn').value = profile.ssn || '';
    document.getElementById('emailAddress').value = profile.emailAddress || '';
    document.getElementById('username').value = profile.username || '';
    document.getElementById('password').value = profile.password || '';
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
      firstName: document.getElementById('firstName').value,
      middleName: document.getElementById('middleName').value,
      lastName: document.getElementById('lastName').value,
      phoneNumber: document.getElementById('phoneNumber').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zip: document.getElementById('zip').value,
      dob: document.getElementById('dob').value,
      ssn: document.getElementById('ssn').value,
      emailAddress: document.getElementById('emailAddress').value,
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
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
});
