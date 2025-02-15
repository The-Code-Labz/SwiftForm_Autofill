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
      'password': ['password', 'pwd'],
      'fullName': ['fullName']
    };

    for (const field in fields) {
      fields[field].forEach(name => {
        let elements = document.querySelectorAll(`input[name*="${name}" i], input[id*="${name}" i], textarea[name*="${name}" i], select[name*="${name}" i], select[id*="${name}" i]`);

        if (field === 'ssn') {
          // Handle split SSN fields
          const ssnElements = Array.from(elements).filter(el => el.type === 'text' && el.maxLength === 3);
          if (ssnElements.length === 3) {
            const ssnValue = profile[field] || '';
            const ssnParts = ssnValue.split('-'); // Split the SSN by hyphens
            if (ssnParts.length === 3) {
              ssnElements[0].value = ssnParts[0];
              ssnElements[1].value = ssnParts[1];
              ssnElements[2].value = ssnParts[2];
            } else {
              console.warn('SSN format in profile is incorrect. Expected format: XXX-XX-XXXX');
            }
            return; // Skip the default filling logic
          }
        } else if (field === 'fullName') {
          // Handle full name splitting
          const fullName = profile[field] || '';
          const nameParts = fullName.split(' ');
          if (nameParts.length >= 2) {
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            // Find and fill first name and last name fields
            fields['firstName'].forEach(firstNameName => {
              const firstNameElements = document.querySelectorAll(`input[name*="${firstNameName}" i], input[id*="${firstNameName}" i]`);
              firstNameElements.forEach(el => {
                el.value = firstName;
              });
            });

            fields['lastName'].forEach(lastNameName => {
              const lastNameElements = document.querySelectorAll(`input[name*="${lastNameName}" i], input[id*="${lastNameName}" i]`);
              lastNameElements.forEach(el => {
                el.value = lastName;
              });
            });
            return;
          } else {
            console.warn('Full name format in profile is incorrect. Expected format: First Last');
          }
        }

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
