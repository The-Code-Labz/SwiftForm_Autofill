document.addEventListener('DOMContentLoaded', function() {
  const profileForm = document.getElementById('profileForm');

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

    // Save the profile to chrome storage
    chrome.storage.sync.get('profiles', function(data) {
      let profiles = data.profiles || [];
      profiles.push(profile);
      chrome.storage.sync.set({ 'profiles': profiles }, function() {
        // Close the tab after saving
        chrome.tabs.getCurrent(function(tab) {
          chrome.tabs.remove(tab.id);
        });
      });
    });
  });
});
