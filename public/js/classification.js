 const form = document.getElementById("add-classification-form");
  form.addEventListener("submit", function (e) {
    const input = document.getElementById("classification_name");
    const regex = /^[A-Za-z0-9]+$/;
    if (!regex.test(input.value)) {
      e.preventDefault();
      alert("Classification name cannot contain spaces or special characters");
      input.focus();
    }
  });