document.addEventListener('DOMContentLoaded', function() {
  const profilesDiv = document.getElementById('profiles');
  const linksDiv = document.getElementById('links');
  const addProfileButton = document.getElementById('addProfile');
  const addLinkButton = document.getElementById('addLink');
  const searchInput = document.getElementById('search');
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const settingsButton = document.querySelector('.settings-button'); // Get the settings button

  let profiles = [];
  let links = [];
  let activeTab = 'profiles';

  // Load data from storage
  loadData();

  function loadData() {
    chrome.storage.sync.get(['profiles', 'links'], function(data) {
      profiles = data.profiles || [];
      links = data.links || [];
      updateUI();
    });
  }

  function saveData() {
    chrome.storage.sync.set({ 'profiles': profiles, 'links': links });
  }

  function updateUI() {
    displayProfiles(profiles);
    displayLinks(links);
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

      const fillButtons = profileDiv.querySelectorAll('.fill-button');
      fillButtons.forEach(button => {
        button.addEventListener('click', function() {
          const index = this.dataset.index;
          fillForm(profiles[index]);
        });
      });

      const editButtons = profileDiv.querySelectorAll('.edit-button');
      editButtons.forEach(button => {
        button.addEventListener('click', function() {
          const index = this.dataset.index;
          editProfile(index);
        });
      });

      const deleteButtons = profileDiv.querySelectorAll('.delete-button');
      deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
          const index = this.dataset.index;
          deleteProfile(index);
        });
      });
    });
  }

  function displayLinks(linksToDisplay) {
    linksDiv.innerHTML = '';
    linksToDisplay.forEach((link, index) => {
      const linkDiv = document.createElement('div');
      linkDiv.classList.add('link');
      linkDiv.innerHTML = `
        <h3>${link.title}</h3>
        <p>${link.url}</p>
        <div class="link-buttons">
          <button class="open-button" data-index="${index}">Open</button>
          <button class="edit-button" data-index="${index}">Edit</button>
          <button class="delete-button" data-index="${index}">Delete</button>
        </div>
      `;
      linksDiv.appendChild(linkDiv);

      const openButtons = linkDiv.querySelectorAll('.open-button');
      openButtons.forEach(button => {
        button.addEventListener('click', function() {
          const index = this.dataset.index;
          openLink(links[index].url);
        });
      });

      const editButtons = linkDiv.querySelectorAll('.edit-button');
      editButtons.forEach(button => {
        button.addEventListener('click', function() {
          const index = this.dataset.index;
          editLink(index);
        });
      });

      const deleteButtons = linkDiv.querySelectorAll('.delete-button');
      deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
          const index = this.dataset.index;
          deleteLink(index);
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

  function openLink(url) {
    chrome.tabs.create({ url: url });
  }

  function editProfile(index) {
    chrome.storage.sync.set({ 'editIndex': index, 'editType': 'profile' }, function() {
      chrome.tabs.create({ url: 'profile.html?edit=true' });
    });
  }

  function editLink(index) {
    chrome.storage.sync.set({ 'editIndex': index, 'editType': 'link' }, function() {
      chrome.tabs.create({ url: 'link.html?edit=true' });
    });
  }

  function deleteProfile(index) {
    profiles.splice(index, 1);
    saveData();
    updateUI();
  }

  function deleteLink(index) {
    links.splice(index, 1);
    saveData();
    updateUI();
  }

  // Add profile functionality
  addProfileButton.addEventListener('click', function() {
    chrome.tabs.create({ url: 'profile.html' });
  });

  // Add link functionality
  addLinkButton.addEventListener('click', function() {
    chrome.tabs.create({ url: 'link.html' });
  });

  // Tab switching functionality
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Deactivate all tabs and hide all content
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.style.display = 'none');

      // Activate the clicked tab and show its content
      const tabId = this.dataset.tab;
      this.classList.add('active');
      document.getElementById(tabId + '-tab').style.display = 'block';

      activeTab = tabId;
    });
  });

  // Search functionality
  searchInput.addEventListener('input', function() {
    const searchTerm = searchInput.value.toLowerCase();
    let filteredProfiles = [];
    let filteredLinks = [];

    if (activeTab === 'profiles') {
      filteredProfiles = profiles.filter(profile => {
        return (
          profile.profileName.toLowerCase().includes(searchTerm) ||
          profile.firstName.toLowerCase().includes(searchTerm) ||
          profile.lastName.toLowerCase().includes(searchTerm) ||
          profile.emailAddress.toLowerCase().includes(searchTerm)
        );
      });
      displayProfiles(filteredProfiles);
    } else if (activeTab === 'links') {
      filteredLinks = links.filter(link => {
        return (
          link.title.toLowerCase().includes(searchTerm) ||
          link.url.toLowerCase().includes(searchTerm)
        );
      });
      displayLinks(filteredLinks);
    }
  });

  // Settings button functionality
  settingsButton.addEventListener('click', openSettings);
});

function openSettings() {
  chrome.runtime.openOptionsPage();
}
