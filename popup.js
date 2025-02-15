document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search');
  const lockButton = document.getElementById('lock');
  const profilesDiv = document.getElementById('profiles');
  const addProfileButton = document.getElementById('addProfile');

  let profiles = [];
  let locked = false;

  // Load profiles from storage
  loadProfiles();

  function loadProfiles() {
    chrome.storage.sync.get(['profiles', 'locked'], function(data) {
      profiles = data.profiles || [];
      locked = data.locked || false;
      updateUI();
    });
  }

  function saveProfiles() {
    chrome.storage.sync.set({ 'profiles': profiles });
  }

  function updateUI() {
    // Update lock button text
    lockButton.textContent = locked ? 'Unlock' : 'Lock';

    // Display profiles
    displayProfiles(profiles);
  }

  function displayProfiles(profilesToDisplay) {
    profilesDiv.innerHTML = '';
    profilesToDisplay.forEach((profile, index) => {
      const profileDiv = document.createElement('div');
      profileDiv.classList.add('profile');
      profileDiv.innerHTML = `
        <h3>${profile.firstName} ${profile.lastName}</h3>
        <p>Email: ${profile.emailAddress}</p>
        <button class="fillButton" data-index="${index}">Fill Form</button>
        <button class="editButton" data-index="${index}">Edit</button>
      `;
      profilesDiv.appendChild(profileDiv);

      const fillButtons = document.querySelectorAll('.fillButton');
      fillButtons.forEach(button => {
        button.addEventListener('click', function() {
          const index = this.dataset.index;
          fillForm(profiles[index]);
        });
      });

      const editButtons = document.querySelectorAll('.editButton');
      editButtons.forEach(button => {
        button.addEventListener('click', function() {
          const index = this.dataset.index;
          editProfile(index);
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
    const fields = {
      'firstName': ['firstName', 'givenName', 'fname', 'fName'],
      'middleName': ['middleName', 'mName', 'middleInitial'],
      'lastName': ['lastName', 'familyName', 'lname', 'lName'],
      'phoneNumber': ['phoneNumber', 'phone', 'phoneNum', 'phone_number'],
      'address': ['address', 'streetAddress', 'street_address', 'addr'],
      'city': ['city', 'town'],
      'state': ['state', 'province'],
      'zip': ['zip', 'zipCode', 'postalCode', 'postcode'],
      'dob': ['dob', 'dateOfBirth', 'birthDate', 'birthday'],
      'ssn': ['ssn', 'socialSecurityNumber'],
      'emailAddress': ['emailAddress', 'email', 'emailId', 'email_address'],
      'username': ['username', 'userName', 'user_name', 'uname'],
      'password': ['password', 'pwd']
    };

    for (const field in fields) {
      fields[field].forEach(name => {
        const elements = document.querySelectorAll(`input[name*="${name}" i], input[id*="${name}" i], textarea[name*="${name}" i], textarea[id*="${name}" i]`);
        elements.forEach(element => {
          if (element) {
            element.value = profile[field] || '';
          }
        });
      });
    }
  }

  // Lock functionality
  lockButton.addEventListener('click', function() {
    locked = !locked;
    chrome.storage.sync.set({ 'locked': locked }, function() {
      updateUI();
    });
  });

  // Search functionality
  searchInput.addEventListener('input', function() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredProfiles = profiles.filter(profile => {
      return (
        profile.firstName.toLowerCase().includes(searchTerm) ||
        profile.lastName.toLowerCase().includes(searchTerm) ||
        profile.emailAddress.toLowerCase().includes(searchTerm)
      );
    });
    displayProfiles(filteredProfiles);
  });

  // Add profile functionality
  addProfileButton.addEventListener('click', function() {
    // Open a new tab or window to add a profile
    chrome.tabs.create({ url: 'profile.html' });
  });

  function editProfile(index) {
    chrome.storage.sync.set({ 'editIndex': index }, function() {
      chrome.tabs.create({ url: 'profile.html?edit=true' });
    });
  }
});
