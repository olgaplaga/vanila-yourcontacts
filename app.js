let selectedRow = null;

function $(selector) {
  return document.querySelector(selector);
}

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
    row.id = `contact-id-${contact.id}`
    row.innerHTML = `
      <td>${contact.firstName}</td>
      <td>${contact.lastName}</td>
      <td>${contact.email}</td>
      <td>${contact.phone}</td>
      <td><i id="btn-delete-${contact.id}" class="bi bi-trash btn btn-primary btn-xs delete"></i>
      <i id="btn-edit-${contact.id}" data-contact-id="${contact.id}" class="bi bi-pencil btn btn-secondary btn-xs edit"></i>
      </td>
      `;
    list.appendChild(row);
  }

  // static editContactInList(contact) {
  //   selectedRow.children[0].textContent = contact.title;
  //   selectedRow.children[1].textContent = contact.author;
  //   selectedRow.children[2].textContent = contact.isbn;

  //   document.querySelector(".sumbit-btn").value = "Add Contact";
  //   document.querySelector(".sumbit-btn").classList =
  //     "btn btn-block btn-warning submit-btn";
  // }

  static editContactInList(newContact) {
    const contacts = Store.getContacts()
    const newContacts = contacts.map((oldContact) => oldContact.id === newContact.id ? newContact : oldContact)
    Store.replaceContacts(newContacts);
    const contactRow = $(`#contact-id-${newContact.id}`)
    console.log(contactRow)
    contactRow.children[0].innerText = newContact.firstName;
  
  }

  static clearFields() {
    const contactId = (document.getElementById("contact-id").value = "");
    const firstName = (document.getElementById("first-name").value = "");
    const lastName = (document.getElementById("last-name").value = "");
    const email = (document.getElementById("email").value = "");
    const phone = (document.getElementById("phone-number").value = "");
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
    }, 3000);
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

  static removeContact(phone) {
    const contacts = Store.getContacts();
    contacts.forEach((contact, index) => {
      if (contact.phone === phone) {
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

//Add Contact Buttn Functionality
document.querySelector(".contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const contactId = document.getElementById("contact-id").value;
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone-number").value;
  //Form validation
  if (firstName === "" || lastName === "" || email === "" || phone === "") {
    UI.showAlert("Please fill all fields", "primary");
  } else {
    const contact = new Contacts(contactId, firstName, lastName, email, phone);
    if (contactId) {
      UI.editContactInList(contact)
    } else {
      UI.addContactToList(contact);
      Store.addContact(contact);

    }

    UI.clearFields();
    // UI.showAlert("Contact Added!", "success");
  }
});

//Delete Button Functionality
document.getElementById("contact-list").addEventListener("click", (event) => {
  if (event.target.id && event.target.id.indexOf("btn-delete-") === 0) {
    UI.deleteContact(event.target);
    UI.showAlert("Contact Deleted!", "danger");
    //getting the phone from the store and removing whole object from storage
    Store.removeContact(
      event.target.parentElement.previousElementSibling.textContent
    );
  }
});

//edit button functionality
document.getElementById("contact-list").addEventListener("click", (event) => {
  if (event.target.id && event.target.id.indexOf("btn-edit") === 0) {
    const id = event.target.dataset.contactId;
    const contact = Store.getContactById(id);


    $("#contact-id").value = contact.id;
    $("#first-name").value = contact.firstName;
    $("#last-name").value = contact.lastName;
    $("#email").value = contact.email;
    $("#phone-number").value = contact.phone;

    //change button name
    $(".submit-btn").classList = "btn btn-block btn-info submit-btn";
    $(".submit-btn").textContent = "Update";

    // UI.showAlert("Contact Edited!", "info");
    //getting the phone from the store and removing whole object from storage
  }
});
