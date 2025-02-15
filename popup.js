document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search');
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
        const elements = document.querySelectorAll(`input[name*="${name}" i], input[id*="${name}" i], textarea[name*="${name}" i], select[name*="${name}" i], select[id*="${name}" i]`);
        elements.forEach(element => {
          if (element) {
            if (element.tagName === 'SELECT') {
              // For dropdowns, set the selected option
              const optionToSelect = Array.from(element.options).find(option => option.value === profile[field] || option.textContent === profile[field]);
              if (optionToSelect) {
                optionToSelect.selected = true;
              }
            } else {
              element.value = profile[field] || '';
            }
          }
        });
      });
    }
  }

  // Search functionality
  searchInput.addEventListener('input', function() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredProfiles = profiles.filter(profile => {
      return (
        profile.profileName.toLowerCase().includes(searchTerm) ||
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
