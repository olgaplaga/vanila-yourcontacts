let selectedRow = null;

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
    phone
  ) {
    this.id = id || Contacts.id();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.flagCode = flagCode;
    this.dialCode = dialCode;
    this.phone = phone;
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

class Address {
  constructor(street, streetNum, flatNum, city, state, postCode, country) {
    this.street = street;
    this.streetNum = streetNum;
    this.flatNum = flatNum;
    this.city = city;
    this.state = state;
    this.postCode = postCode;
    this.country = country;
  }
}

//UI class
class UI {
  static displayContacts() {
    const contacts = Store.getContacts();
    contacts.forEach((contact) => UI.addContactToList(contact));
  }
  //!!!!!!!
  static displayAddress() {
    const address = Store.getAddress();
    address.forEach((address) => UI.addAddressToList(address))
  }

  static addContactToList(contact) {
    const list = $("#contact-list");
    const row = document.createElement("tr");
    row.id = `contact-id-${contact.id}`;
    row.className = "row-clear";
    row.innerHTML = `
      <td>${contact.firstName}</td>
      <td>${contact.lastName}</td>
      <td>${contact.email}</td>
      <td>${contact.dialCode} ${contact.phone}</td>
      <td><i class="btn text-info bi bi-three-dots"></i> </td>
      <td>
        <i id="btn-edit-${contact.id}" title="Edit" data-contact-id="${contact.id}" class="bi bi-pencil btn btn-info btn-xs edit"></i>
        <i id="btn-delete-${contact.id}" title="Delete" class="bi bi-trash btn btn-primary btn-xs delete"></i>
      </td>
      `;
    list.appendChild(row);
  }

  static addAddressToForm({ address }) {
    const form = $(".more-fields");
    const fieldsGroup = document.createElement('div');
    fieldsGroup.className = "address-group"
    fieldsGroup.innerHTML = `
    <div class="form-group mb-3">
      <label for="${address.street}" class="form-label">Street</label>
      <input type="text" class="form-control" id="${address.street}" name="${address.street}"></input>
    </div>
    <div class="form-group mb-3">
      <label for="${address.streetNum}" class="form-label">Street Number</label>
      <input type="text" class="form-control" id="${address.streetNum}" name="${address.streetNum}"></input>
    </div>
    <div class="form-group mb-3">
      <label for="${address.flatNum}" class="form-label">Flat Number</label>
      <input type="text" class="form-control" id="${address.flatNum}" name="${address.flatNum}"></input>
    </div>
    <div class="form-group mb-3">
      <label for="${address.city}" class="form-label">City</label>
      <input type="text" class="form-control" id="${address.city}" name="${address.city}"></input>
    </div>
    <div class="form-group mb-3">
      <label for="${address.state}" class="form-label">State</label>
      <input type="text" class="form-control" id="${address.state}" name="${address.state}"></input>
    </div>
    <div class="form-group mb-3">
      <label for="${address.postCode}" class="form-label">Post Code</label>
      <input type="text" class="form-control" id="${address.postCode}" name="${address.postCode}"></input>
    </div>
    <div class="form-group mb-3">
      <label for="${address.country}" class="form-label">Country</label>
      <input type="text" class="form-control" id="${address.country}" name="${address.country}"></input>
    </div>
    `;
    form.appendChild(fieldsGroup);
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
  }

  static deleteContact(element) {
    element.parentElement.parentElement.remove();
  }

  static showAlert(message, className) {
    const div = document.createElement("div");
    div.className = `alert alert-${className} mt-5`;
    div.appendChild(document.createTextNode(message));
    const form = document.querySelector(".contact-form");
    form.appendChild(div);
    setTimeout(() => {
      document.querySelector(".alert").remove();
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

    //   contacts.filter((contact) => {contact.phone !== phone})
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
      phone
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
      UI.addContactToList(contact);
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
    console.log($(`#btn-delete-${contact.id}`));

    //edit validation - can not double click edit before updating change
  } else if (
    event.target.id &&
    event.target.id.indexOf("btn-edit") === 0 &&
    $(".submit-btn").textContent === "Update"
  ) {
    event.preventDefault();
    console.log(event.target);
    $(".submit-btn").classList.remove("shake");
    $(".submit-btn").offsetWidth;
    $(".submit-btn").classList.add("shake");
  }
});
