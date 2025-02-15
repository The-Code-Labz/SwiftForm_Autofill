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
        // Handle split SSN fields with identifiers ssn_1, ssn_2, ssn_3
        const ssn1 = document.querySelector('input[id="ssn_1" i][name="ssn_1" i]');
        const ssn2 = document.querySelector('input[id="ssn_2" i][name="ssn_2" i]');
        const ssn3 = document.querySelector('input[id="ssn_3" i][name="ssn_3" i]');

        if (ssn1 && ssn2 && ssn3) {
          const ssnValue = profile[field] || '';
          const ssnParts = ssnValue.split('-'); // Split the SSN by hyphens
          if (ssnParts.length === 3) {
            ssn1.value = ssnParts[0] || '';
            ssn2.value = ssnParts[1] || '';
            ssn3.value = ssnParts[2] || '';
          } else {
            console.warn('SSN format in profile is incorrect. Expected format: XXX-XX-XXXX');
          }
          return; // Skip the default filling logic
        }
      } else if (field === 'fullName') {
        // Handle full name splitting
        const fullName = profile[field] || '';
        const nameParts = fullName.split(' ');
        if (nameParts.length >= 1) {
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Find and fill first name and last name fields
          fields['firstName'].forEach(firstNameName => {
            const firstNameElements = document.querySelectorAll(`input[name*="${firstNameName}" i], input[id*="${firstNameName}" i]`);
            firstNameElements.forEach(el => {
              if (el) el.value = firstName;
            });
          });

          fields['lastName'].forEach(lastNameName => {
            const lastNameElements = document.querySelectorAll(`input[name*="${lastNameName}" i], input[id*="${lastNameName}" i]`);
            lastNameElements.forEach(el => {
              if (el) el.value = lastName;
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

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "fillForm") {
      setFormValues(request.profile);
    }
  }
);
