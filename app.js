function create(element) {
  return document.createElement(element);
}

function $(selector) {
  return document.querySelector(selector);
}

//international dial code see : https://www.jqueryscript.net/form/jQuery-International-Telephone-Input-With-Flags-Dial-Codes.html#google_vignette
const phoneInputField = $("#phone-number");
const phoneInput = window.intlTelInput(phoneInputField, {
  separateDialCode: true,
  initialCountry: "pl",
  localizedCountries: "pl",
  preferredCountries: ["pl"],
  hiddenInput: "full_phone",
  formatOnDisplay: true,
  utilsScript:
    "//cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.3/js/utils.js",
});

//Contact class
class Contacts {
  constructor(
    id = null,
    firstName,
    lastName,
    email,
    flagCode,
    dialCode,
    phone,
    addresses = []
  ) {
    this.id = id || Contacts.id();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.flagCode = flagCode;
    this.dialCode = dialCode;
    this.phone = phone;
    this.addresses = addresses;
  }

  // see: https://gist.github.com/jsmithdev/1f31f9f3912d40f6b60bdc7e8098ee9f

  static id() {
    let dt = new Date().getTime();

    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );

    return uuid;
  }
}

const addressFormData = {
  street: ["Street", "street", "text"],
  streetNum: ["Street Number", "street-num", "number"],
  flatNum: ["Flat Number", "flat-number", "number"],
  city: ["City", "city", "text"],
  state: ["State", "state", "text"],
  postCode: ["Postal Code", "postal-code", "text"],
  country: ["Country", "country", "text"],
};

//UI class
class UI {
  static displayContacts() {
    const contacts = Store.getContacts();
    contacts.forEach((contact) => {
      UI.addContactToList(contact);
      UI.addAddressToList(contact);
    });
  }

  static addContactToList(contact) {
    const list = $("#contact-list");
    const row = create("tr");
    row.id = `contact-id-${contact.id}`;
    row.className = "row-folded";
    row.innerHTML = `
      <td>${contact.firstName}</td>
      <td>${contact.lastName}</td>
      <td>${contact.email}</td>
      <td>${contact.dialCode} ${contact.phone}</td>
      <td><i id="btn-more-${contact.id}" class="btn btn-xs text-info bi bi-three-dots toggle"></i> </td>
      <td>
        <i id="btn-edit-${contact.id}" title="Edit" data-contact-id="${contact.id}" class="bi bi-pencil btn btn-info btn-xs edit"></i>
        <i id="btn-delete-${contact.id}" title="Delete" class="bi bi-trash btn btn-primary btn-xs delete"></i>
      </td>
      `;
    list.appendChild(row);
  }

  // see : https://getbootstrap.com/docs/5.1/content/tables/#nesting

  static addAddressToList(contact) {
    const oldTableBody = $("#contact-list");
    const oldRow = $(`#contact-id-${contact.id}`);
    const newRow = create("tr");
    const newData = create("td");
    const newTable = create("table");
    const newRowHead = create("thead");
    const newRowHeader = create("tr");
    const newTableBody = create("tbody");

    newRowHeader.className = "table-secondary";
    newTable.className = "table mt-2 mb-2";
    newData.setAttribute("colspan", "6");
    newRow.className = "address-added";
    newRow.id = `address-container-contact-id-${contact.id}`;
    
    newRowHeader.innerHTML = `
    <th>Street</th>
    <th>No.</th>
    <th>Flat</th>
    <th>City</th>
    <th>State</th>
    <th>Post Code</th>
    <th>Country</th>
    `;
    
    contact.addresses.forEach((address) => {
      const newRowAddress = create("tr");
      newRowAddress.id = `address-id-${address.id}`;
      console.log("newRowAddress:", newRowAddress)
      
      newRowAddress.innerHTML = `
      <td>${address.street}</td>
      <td>${address.streetNum}</td>
      <td>${address.flatNum}</td>
      <td>${address.city}</td>
      <td>${address.state}</td>
      <td>${address.postCode}</td>
      <td>${address.country}</td>
      `;
      newTableBody.appendChild(newRowAddress);

    })
    
    newRowHead.appendChild(newRowHeader);
    newTable.appendChild(newRowHead);
    newTable.appendChild(newTableBody);
    newData.appendChild(newTable);
    newRow.appendChild(newData);
    oldTableBody.insertBefore(newRow, oldRow.nextSibling);
    
    
  }

  static toggleAddress(address) {
    if (address.className === "address-added") {
      address.className = "address-removed";
    } else {
      address.className = "address-added";
    }
  }

  static addAddressForm() {
    const form = $(".more-fields");
    const group = create("div");
    const id = Contacts.id();
    group.className = `address-group mt-5`;
    group.innerHTML = `
    <h4>Address</h4>
    <input type="hidden" id="address-id-${id}" name="addressId" value="${id}">
    `;
    for (const key in addressFormData) {
      const fieldsGroup = create("div");
      fieldsGroup.className = "form-group mb-3";
      // fieldsGroup.id = `address-id`;
      fieldsGroup.innerHTML = `
        <label for="${addressFormData[key][1]}" class="form-label">${addressFormData[key][0]}</label>
        <input type="${addressFormData[key][2]}" class="form-control" id="${addressFormData[key][1]}-${id}" name="${addressFormData[key][1]}" value></input>
        `;
      form.appendChild(group);
      group.appendChild(fieldsGroup);
    }
  }

  static editContactInList(newContact) {
    const contacts = Store.getContacts();
    const newContacts = contacts.map((oldContact) =>
      oldContact.id === newContact.id ? newContact : oldContact
    );

    Store.replaceContacts(newContacts);
    const contactRow = $(`#contact-id-${newContact.id}`);
    contactRow.children[0].innerText = newContact.firstName;
    contactRow.children[1].innerText = newContact.lastName;
    contactRow.children[2].innerText = newContact.email;
    contactRow.children[3].innerText = `${newContact.dialCode} ${newContact.phone}`;
  }

  static clearFields() {
    const contactId = ($("#contact-id").value = "");
    const firstName = ($("#first-name").value = "");
    const lastName = ($("#last-name").value = "");
    const email = ($("#email").value = "");
    const phone = ($("#phone-number").value = "");

    // const addressId = ($("#address-id").value = "");
    // const street = ($("#street").value = "");
    // const streetNum = ($("#street-num").value = "");
    // const flatNum = ($("#flat-number").value = "");
    // const city = ($("#city").value = "");
    // const state = ($("#state").value = "");
    // const postCode = ($("#postal-code").value = "");
    // const country = ($("#country").value = "");
  }

  static deleteContact(element) {
    element.parentElement.parentElement.remove();
  }

  static showAlert(message, className) {
    const div = create("div");
    const form = $(".contact-form");
    div.className = `alert alert-${className} mt-5`;
    div.appendChild(document.createTextNode(message));
    form.appendChild(div);

    setTimeout(() => {
      $(".alert").remove();
    }, 2000);
  }
}

class Store {
  static getContacts() {
    let contacts;
    if (localStorage.getItem("contacts") === null) {
      contacts = [];
    } else {
      contacts = JSON.parse(localStorage.getItem("contacts"));
    }
    return contacts;
  }

  static addContact(contact) {
    const contacts = Store.getContacts();
    contacts.unshift(contact);
    Store.replaceContacts(contacts);
  }

  static replaceContacts(newContacts) {
    localStorage.setItem("contacts", JSON.stringify(newContacts));
  }

  static removeContact(id) {
    const contacts = Store.getContacts();
    contacts.forEach((contact, index) => {
      if (`btn-delete-${contact.id}` === id) {
        contacts.splice(index, 1);
      }
    });

    localStorage.setItem("contacts", JSON.stringify(contacts));
  }

  static getContactById(id) {
    return Store.getContacts().find((contact) => contact.id === id);
  }
}

//Display actual Local Storage
document.addEventListener("DOMContentLoaded", UI.displayContacts);

//Add Contact Btn Functionality
$(".contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const contactId = $("#contact-id").value;
  const firstName = $("#first-name").value;  
  const lastName = $("#last-name").value;
  const email = $("#email").value;
  const phone = $("#phone-number").value;
  const dialCode = $(".iti__selected-dial-code").textContent;
  const flagCode = $(".iti__selected-flag").children[0].className;

const addresses= [];

  $(".more-fields").querySelectorAll(`.address-group`).forEach(addressDiv => {
    const addressId = addressDiv.querySelector("[id^=address-id]").value;
    const street = addressDiv.querySelector(`[name=street]`).value;
    const streetNum = addressDiv.querySelector(`[name=street-num]`).value;
    const flatNum = addressDiv.querySelector(`[name=flat-number]`).value;
    const city = addressDiv.querySelector(`[name=city]`).value;
    const state = addressDiv.querySelector(`[name=state]`).value;
    const postCode = addressDiv.querySelector(`[name=postal-code]`).value;
    const country = addressDiv.querySelector(`[name=country]`).value;

    addresses.push( 
      {
        id: addressId,
        street: street,
        streetNum: streetNum,
        flatNum: flatNum,
        city: city,
        state: state,
        postCode: postCode,
        country: country,
      }
    )
    
  })

  // console.log(addresses)


  
  //Form validation
  if (firstName === "" || lastName === "" || email === "" || phone === "") {
    UI.showAlert("Please fill all fields", "primary");
  } else {
    const contact = new Contacts(
      contactId,
      firstName,
      lastName,
      email,
      flagCode,
      dialCode,
      phone,
      addresses,
    );
    if (contactId) {
      UI.editContactInList(contact);
      UI.showAlert("Contact Edited!", "info");
      $(".submit-btn").classList = "btn btn-block btn-warning submit-btn";
      $(".submit-btn").textContent = "Add Contact";

      // bring back delete after updating
      $(`#btn-delete-${contactId}`).removeAttribute("disabled", "false");

      //change back row style
      $(`#contact-id-${contactId}`).className = "table";
    } else {
      // console.log(contact)
      UI.addContactToList(contact);
      UI.addAddressToList(contact);
      Store.addContact(contact);
      UI.showAlert("Contact Added!", "success");
    }
    UI.clearFields();
  }
});

//Restart form button
$("#restart-form").addEventListener("click", (event) => {
  event.preventDefault();

  //restart while submiting
  if (
    event.target.id === "restart-form" &&
    $(".submit-btn").textContent === "Add Contact"
  ) {
    UI.clearFields();
  }

  //restart while editing
  else if (
    event.target.id === "restart-form" &&
    $(".submit-btn").textContent === "Update"
  ) {
    const contactId = $("#contact-id").value;
    $(`#contact-id-${contactId}`).className = "table";
    $(`#btn-delete-${contactId}`).removeAttribute("disabled", "false");
    $(".iti__selected-flag").children[0].className = "iti__flag iti__pl";
    $(".iti__selected-dial-code").textContent = "+48";

    UI.clearFields();
  }
  $(".submit-btn").classList = "btn btn-block btn-warning submit-btn";
  $(".submit-btn").textContent = "Add Contact";
});

//Delete and Edit Button Functionality

$("#contact-list").addEventListener("click", (event) => {
  if (
    event.target.id &&
    event.target.id.indexOf("btn-delete-") === 0 &&
    !event.target.hasAttribute("disabled")
  ) {
    UI.deleteContact(event.target);
    UI.showAlert("Contact Deleted!", "danger");
    Store.removeContact(event.target.id);
  } else if (
    event.target.id &&
    event.target.id.indexOf("btn-edit") === 0 &&
    $(".submit-btn").textContent === "Add Contact"
  ) {
    //Take data from edited field by id
    const id = event.target.dataset.contactId;
    const contact = Store.getContactById(id);

    //change row style
    $(`#contact-id-${contact.id}`).className = "table table-primary";

    //push this data to the form fields for edition
    $("#contact-id").value = contact.id;
    $("#first-name").value = contact.firstName;
    $("#last-name").value = contact.lastName;
    $("#email").value = contact.email;
    $("#phone-number").value = contact.phone;
    $(".iti__selected-dial-code").textContent = contact.dialCode;
    $(".iti__selected-flag").children[0].className = contact.flagCode;

    //change button name
    $(".submit-btn").classList = "btn btn-block btn-info submit-btn";
    $(".submit-btn").textContent = "Update";

    //Unable to delete edited data
    $(`#btn-delete-${contact.id}`).setAttribute("disabled", "true");

    //edit validation - can not double click edit before updating change
  } else if (
    event.target.id &&
    event.target.id.indexOf("btn-edit") === 0 &&
    $(".submit-btn").textContent === "Update"
  ) {
    event.preventDefault();
    $(".submit-btn").classList.remove("shake");
    $(".submit-btn").offsetWidth;
    $(".submit-btn").classList.add("shake");

    //three dots more button
  } else if (event.target.id && event.target.id.indexOf("btn-more-") === 0) {
    event.preventDefault();
    const button = event.target;

    const id = event.target.id.slice(9);
    const address = $(`#address-container-contact-id-${id}`);
    UI.toggleAddress(address);
  }
});



//Add address form
$("#more-btn").addEventListener("click", (event) => {
  event.preventDefault();
  UI.addAddressForm();
});


let addresses = [
  {
    id: 1,
    street: "filipowska",
    streetNum: 5,
    flatNum: "",
    city: "bakalarzewo",
    state: "state",
    postCode: "16-234",
    country: "poland",
  },

  {
    id: 2,
    street: "odolanska",
    streetNum: 5,
    flatNum: "",
    city: "Warszawa",
    state: "state",
    postCode: "16-234",
    country: "poland",
  }
];

// console.log(addresses.forEach((address, index) => {console.log(address)}))