//Contact class
class Contacts {
  constructor(firstName, lastName, email, phone) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
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
    row.innerHTML = `
      <td>${contact.firstName}</td>
      <td>${contact.lastName}</td>
      <td>${contact.email}</td>
      <td>${contact.phone}</td>
      <td><i class="bi bi-trash btn btn-primary btn-xs delete"></i></a><i class="btn btn-xs btn-info bi bi-pencil edit"></i></td>
      `;
    list.appendChild(row);
  }

  static clearFields() {
    const firstName = (document.getElementById("first-name").value = "");
    const lastName = (document.getElementById("last-name").value = "");
    const email = (document.getElementById("email").value = "");
    const phone = (document.getElementById("phone-number").value = "");
  }

  static deleteContact(element) {
    if (element.classList.contains("delete")) {
      element.parentElement.parentElement.remove();
    }
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
      localStorage.setItem('contacts', JSON.stringify(contacts))
      console.log(contacts)
  }

  static removeContact(phone) {
      const contacts = Store.getContacts();
        contacts.forEach((contact, index)=> {
            if(contact.phone === phone){
                contacts.splice(index, 1);
            }
        })

    //   contacts.filter((contact) => {contact.phone !== phone})
     localStorage.setItem('contacts', JSON.stringify(contacts))
  }

}

//Display actual Local Storage
document.addEventListener("DOMContentLoaded", UI.displayContacts);

//Add Contact Buttn Functionality
document.querySelector(".contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone-number").value;

  //Form validation
  if (firstName === "" || lastName === "" || email === "" || phone === "") {
    UI.showAlert("Please fill all fields", "primary");
  } else {
      
    const contact = new Contacts(firstName, lastName, email, phone);
    UI.addContactToList(contact);
    Store.addContact(contact)
    UI.clearFields();
    UI.showAlert("Contact Added!", "success");
  }
});

//Delete Button Functionality
document.getElementById("contact-list").addEventListener("click", (event) => {
  UI.deleteContact(event.target);
  UI.showAlert("Contact Deleted!", "danger");
  //getting the phone from the store and removing whole object from storage
  Store.removeContact(event.target.parentElement.previousElementSibling.innerText)
});
