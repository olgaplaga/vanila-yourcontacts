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
  constructor(id = null, firstName, lastName, email, phone) {
    this.id = id || Contacts.id();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
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

//UI class
class UI {
  static displayContacts() {
    const contacts = Store.getContacts();
    contacts.forEach((contact) => UI.addContactToList(contact));
  }

  static addContactToList(contact) {
    const list = document.getElementById("contact-list");
    const row = document.createElement("tr");
    const dialCode = phoneInput.s.dialCode;

    row.id = `contact-id-${contact.id}`;
    row.className = "row-clear";
    row.innerHTML = `
      <td>${contact.firstName}</td>
      <td>${contact.lastName}</td>
      <td>${contact.email}</td>
      <td>${contact.phone}</td>
      <td><i id="btn-delete-${contact.id}" class="bi bi-trash btn btn-primary btn-xs delete"></i>
      <i id="btn-edit-${contact.id}" data-contact-id="${contact.id}" class="bi bi-pencil btn btn-info btn-xs edit"></i>
      </td>
      `;
    list.appendChild(row);
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
    contactRow.children[3].innerText = newContact.phone;
  }

  static clearFields() {
    const contactId = ($("#contact-id").value = "");
    const firstName = ($("#first-name").value = "");
    const lastName = ($("#last-name").value = "");
    const email = ($("#email").value = "");
    const phone = ($("#phone-number").value = "");
    const dialCode = (phoneInput.s.dialCode = "");
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
    contacts.push(contact);
    Store.replaceContacts(contacts);
  }

  static replaceContacts(newContacts) {
    localStorage.setItem("contacts", JSON.stringify(newContacts));
  }

  static removeContact(id) {
    const contacts = Store.getContacts();
    console.log(id);
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
  const phoneBody = $("#phone-number").value;
  const dialCode = phoneInput.s.dialCode;
  const phone = `+${dialCode} ${phoneBody}`;

  //Form validation
  if (firstName === "" || lastName === "" || email === "" || phone === "") {
    UI.showAlert("Please fill all fields", "primary");
  } else {
    const contact = new Contacts(contactId, firstName, lastName, email, phone);
    if (contactId) {
      UI.editContactInList(contact);
      $(".submit-btn").classList = "btn btn-block btn-warning submit-btn";
      $(".submit-btn").textContent = "Add Contact";
      UI.showAlert("Contact Edited!", "info");

      //change back row style
      $(`#contact-id-${contact.id}`).className = "table";
    } else {
      UI.addContactToList(contact);
      Store.addContact(contact);
      UI.showAlert("Contact Added!", "success");
    }
    UI.clearFields();
  }
});

//Delete and Edit Button Functionality
$("#contact-list").addEventListener("click", (event) => {
  if (event.target.id && event.target.id.indexOf("btn-delete-") === 0) {
    UI.deleteContact(event.target);
    UI.showAlert("Contact Deleted!", "danger");
    Store.removeContact(event.target.id);

    //edit button finctionality
  } else if (event.target.id && event.target.id.indexOf("btn-edit") === 0) {
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
    
    //exclude dial code from phone input for editing purpose
    const dialCode = phoneInput.s.dialCode;
    const regex = /([^\s]+)/
    $("#phone-number").value = contact.phone.replace(contact.phone.match(regex)[0], '');

    //change button name
    $(".submit-btn").classList = "btn btn-block btn-info submit-btn";
    $(".submit-btn").textContent = "Update";
  }
});
