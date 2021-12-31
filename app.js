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
    const storeContacts = [
      {
        firstName: "Monika",
        lastName: "Kala",
        email: "emili@o2.pl",
        phone: "234567876",
      },
    ];
    const contacts = storeContacts;
    contacts.forEach((contact) => UI.addContactToList(contact));
  }

  static addContactToList(contact) {
    const list = document.getElementById("contact-list");
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${contact.firstName}<td>
      <td>${contact.lastName}<td>
      <td>${contact.email}<td>
      <td>${contact.phone}<td>
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

//Event listeners
document.addEventListener("DOMContentLoaded", UI.displayContacts);

//Event Add Contact Button
document.querySelector(".contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone-number").value;

  if (firstName === "" || lastName === "" || email === "" || phone === "") {
    UI.showAlert("Please fill all fields", "primary");
  } else {
    const contact = new Contacts(firstName, lastName, email, phone);

    UI.addContactToList(contact);
    UI.clearFields();
    UI.showAlert("Contact Added!", "success");
  }
});

//event delete
document.getElementById("contact-list").addEventListener("click", (event) => {
  // event.preventDefault();
  UI.deleteContact(event.target);
  UI.showAlert("Contact Deleted!", "danger");
});
