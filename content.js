console.log('Form Autofill content script running.');

function setFormValues(profile) {
  const fields = {
    'firstName': ['firstName', 'givenName', 'fname', 'fName'],
    'middleName': ['middleName', 'mName', 'middleInitial'],
    'lastName': ['lastName', 'familyName', 'lname', 'lName'],
    'phoneNumber': ['phoneNumber', 'phone', 'phoneNum', 'phone_number'],
    'address': ['address', 'streetAddress', 'street_address', 'addr'],
    'address2': ['address2', 'addressLine2', 'apartment', 'apt'],
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
        const ssn1 = document.querySelector('input[id="ssn_1"][name="ssn_1"]');
        const ssn2 = document.querySelector('input[id="ssn_2"][name="ssn_2"]');
        const ssn3 = document.querySelector('input[id="ssn_3"][name="ssn_3"]');

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
        } else {
          // If split fields are not found, fill the single SSN field if it exists
          elements.forEach(element => {
            if (element) {
              if (element.tagName === 'SELECT') {
                // For dropdowns, set the selected option
                const optionToSelect = Array.from(element.options).find(option => option.value === profile[field] || option.textContent === profile[field]);
                if (optionToSelect) {
                  optionToSelect.selected = true;
                } else if (element.options.length > 0) {
                  element.options[0].selected = true;
                }
              } else {
                element.value = profile[field] || '';
              }
            }
          });
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
      } else {
        elements.forEach(element => {
          if (element) {
            if (element.tagName === 'SELECT') {
              // For dropdowns, set the selected option
              const optionToSelect = Array.from(element.options).find(option => option.value === profile[field] || option.textContent === profile[field]);
              if (optionToSelect) {
                optionToSelect.selected = true;
              } else if (element.options.length > 0) {
                  element.options[0].selected = true;
              }
            } else {
              element.value = profile[field] || '';
            }
          }
        });
      }
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
