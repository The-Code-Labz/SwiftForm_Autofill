document.addEventListener('DOMContentLoaded', function() {
  const profileList = document.getElementById('profileList');
  const profilesTab = document.getElementById('profiles-tab');
  const settingsTab = document.getElementById('settings-tab');

  // Function to switch to the Profiles tab
  function switchToProfilesTab() {
    profilesTab.classList.add('active');
    settingsTab.classList.remove('active');
    document.getElementById('profiles').style.display = 'block';
    document.getElementById('settings').style.display = 'none';
    loadProfiles(); // Reload profiles when switching back
  }

    // Function to switch to the Settings tab
    function switchToSettingsTab() {
        settingsTab.classList.add('active');
        profilesTab.classList.remove('active');
        document.getElementById('settings').style.display = 'block';
        document.getElementById('profiles').style.display = 'none';
    }

  // Event listener for Profiles tab
  profilesTab.addEventListener('click', switchToProfilesTab);

    // Event listener for Settings tab
    settingsTab.addEventListener('click', switchToSettingsTab);

  // Load profiles
  function loadProfiles() {
    chrome.storage.sync.get('profiles', function(data) {
      const profiles = data.profiles || [];
      profileList.innerHTML = ''; // Clear existing list

      if (profiles.length === 0) {
        profileList.innerHTML = '<li class="no-profiles">No profiles created yet.</li>';
      } else {
        profiles.forEach(function(profile, index) {
          const listItem = document.createElement('li');
          listItem.textContent = profile.profileName;
          listItem.setAttribute('data-index', index);

          // Add edit button
          const editButton = document.createElement('button');
          editButton.textContent = 'Edit';
          editButton.classList.add('edit-button');
          editButton.addEventListener('click', function(event) {
            event.stopPropagation();
            chrome.storage.sync.set({ 'editIndex': index }, function() {
              chrome.tabs.create({ url: 'profile.html?edit=true' });
            });
          });

          // Add delete button
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.classList.add('delete-button');
          deleteButton.addEventListener('click', function(event) {
            event.stopPropagation();
            if (confirm('Are you sure you want to delete this profile?')) {
              profiles.splice(index, 1);
              chrome.storage.sync.set({ 'profiles': profiles }, function() {
                loadProfiles(); // Reload profiles after deletion
              });
            }
          });

          listItem.appendChild(editButton);
          listItem.appendChild(deleteButton);
          profileList.appendChild(listItem);
        });
      }
    });
  }

  // Load profiles on popup load
  loadProfiles();

  // Add Profile button
  const addProfileButton = document.getElementById('addProfile');
  addProfileButton.addEventListener('click', function() {
    chrome.tabs.create({ url: 'profile.html' });
  });

  // Fill Form button
const fillFormButton = document.getElementById('fillForm');
fillFormButton.addEventListener('click', function() {
  const selectedProfileIndex = profileList.querySelector('.selected')?.getAttribute('data-index');
  console.log('Fill Form button clicked. Selected profile index:', selectedProfileIndex);

  if (selectedProfileIndex !== undefined && selectedProfileIndex !== null) {
    chrome.storage.sync.get('profiles', function(data) {
      const profiles = data.profiles || [];
      const selectedProfile = profiles[selectedProfileIndex];
      console.log('Selected profile data:', selectedProfile);

      // Send message to background script
      chrome.runtime.sendMessage({ message: "fillForm", profile: selectedProfile }, function(response) {
          console.log("Response from background script:", response);
      });
    });
  } else {
    console.warn('No profile selected.');
    alert('Please select a profile to fill the form.');
  }
});


  // Select profile
  profileList.addEventListener('click', function(event) {
    if (event.target.tagName === 'LI') {
      const selectedIndex = event.target.getAttribute('data-index');
      const allProfiles = profileList.querySelectorAll('li');

      allProfiles.forEach(function(profile) {
        profile.classList.remove('selected');
      });

      event.target.classList.add('selected');
    }
  });

    // Event listener for Settings tab
    document.getElementById('settings-tab').addEventListener('click', function() {
        // Switch to Settings tab
        document.getElementById('profiles-tab').classList.remove('active');
        this.classList.add('active');
        document.getElementById('profiles').style.display = 'none';
        document.getElementById('settings').style.display = 'block';
    });
});
