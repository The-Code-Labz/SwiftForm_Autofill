document.addEventListener('DOMContentLoaded', function() {
  const profileList = document.getElementById('profileList');
  const profilesTab = document.getElementById('profiles-tab');
  const linksTab = document.getElementById('links-tab');
  const profilesContent = document.getElementById('profiles');
  const linksContent = document.getElementById('links');
  const addProfileButton = document.getElementById('addProfile');
  const fillFormButton = document.getElementById('fillForm');

  // Function to switch tabs
  function switchTab(tabId) {
    // Remove active class from all tab buttons and hide all tab content
    [profilesTab, linksTab].forEach(tab => tab.classList.remove('active'));
    [profilesContent, linksContent].forEach(content => content.style.display = 'none');

    // Add active class to the clicked tab and show corresponding content
    document.getElementById(tabId + '-tab').classList.add('active');
    document.getElementById(tabId).style.display = 'block';

    if (tabId === 'profiles') {
      loadProfiles(); // Reload profiles when switching to the Profiles tab
    }
  }

  // Event listener for Profiles tab
  if (profilesTab) {
    profilesTab.addEventListener('click', () => switchTab('profiles'));
  } else {
    console.error("profilesTab element not found");
  }

  // Event listener for Links tab
  if (linksTab) {
    linksTab.addEventListener('click', () => switchTab('links'));
  } else {
    console.error("linksTab element not found");
  }

  // Load profiles
  function loadProfiles() {
    if (!profileList) {
      console.error("profileList element not found");
      return;
    }
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

  // Add Profile button
  if(addProfileButton) {
    addProfileButton.addEventListener('click', function() {
      chrome.tabs.create({ url: 'profile.html' });
    });
  } else {
    console.error("addProfileButton element not found");
  }

  // Fill Form button
  if (fillFormButton) {
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
  } else {
    console.error("fillFormButton element not found");
  }

// Select profile - DEBUGGING VERSION
if (profileList) {
  profileList.addEventListener('click', function(event) {
    console.log("profileList click event triggered");
    const listItem = event.target.closest('li');
    console.log("Clicked element:", event.target);
    console.log("Closest li:", listItem);

    if (listItem && profileList.contains(listItem)) {
      console.log("Valid list item clicked");
      const allProfiles = profileList.querySelectorAll('li');
      allProfiles.forEach(function(profile) {
        console.log("Removing 'selected' from:", profile);
        profile.classList.remove('selected');
      });

      console.log("Adding 'selected' to:", listItem);
      listItem.classList.add('selected');
      console.log("classList after adding:", listItem.classList);
    } else {
      console.log("Clicked element is not a valid list item within profileList");
    }
  });
} else {
  console.error("profileList element not found in select profile listener");
}

  // Initial load (show Profiles tab by default)
  switchTab('profiles');
});
