document.addEventListener('DOMContentLoaded', function() {
  const profilesDiv = document.getElementById('profiles');
  const addProfileButton = document.getElementById('addProfile');

  let profiles = [];

  // Load profiles from storage
  loadProfiles();

  function loadProfiles() {
    chrome.storage.sync.get(['profiles'], function(data) {
      profiles = data.profiles || [];
      updateUI();
    });
  }

  function saveProfiles() {
    chrome.storage.sync.set({ 'profiles': profiles });
  }

  function updateUI() {
    // Display profiles
    displayProfiles(profiles);
  }

  function displayProfiles(profilesToDisplay) {
    profilesDiv.innerHTML = '';
    profilesToDisplay.forEach((profile, index) => {
      const profileDiv = document.createElement('div');
      profileDiv.classList.add('profile');
      profileDiv.innerHTML = `
        <h3>${profile.profileName}</h3>
        <p>${profile.firstName} ${profile.lastName}</p>
        <div class="profile-buttons">
          <button class="fill-button" data-index="${index}">Fill</button>
          <button class="edit-button" data-index="${index}">Edit</button>
          <button class="delete-button" data-index="${index}">Delete</button>
        </div>
      `;
      profilesDiv.appendChild(profileDiv);

      const fillButtons = document.querySelectorAll('.fill-button');
      fillButtons.forEach(button => {
        button.addEventListener('click', function() {
          const index = this.dataset.index;
          fillForm(profiles[index]);
        });
      });

      const editButtons = document.querySelectorAll('.edit-button');
      editButtons.forEach(button => {
        button.addEventListener('click', function() {
          const index = this.dataset.index;
          editProfile(index);
        });
      });

      const deleteButtons = document.querySelectorAll('.delete-button');
      deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
          const index = this.dataset.index;
          deleteProfile(index);
        });
      });
    });
  }

  function fillForm(profile) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: setFormValues,
        args: [profile]
      });
    });
  }

  function setFormValues(profile) {
    // This function is defined in content.js
    // It is executed in the context of the web page
  }

  function editProfile(index) {
    chrome.storage.sync.set({ 'editIndex': index }, function() {
      chrome.tabs.create({ url: 'profile.html?edit=true' });
    });
  }

  function deleteProfile(index) {
    profiles.splice(index, 1);
    saveProfiles();
    updateUI();
  }

  // Add profile functionality
  addProfileButton.addEventListener('click', function() {
    // Open a new tab or window to add a profile
    chrome.tabs.create({ url: 'profile.html' });
  });
});
