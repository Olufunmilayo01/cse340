document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("toggle-password");
  const pwd = document.getElementById("password");

  btn.addEventListener("click", () => {
    if (pwd.type === "password") {
      pwd.type = "text";
      btn.textContent = "Hide Password";
    } else {
      pwd.type = "password";
      btn.textContent = "Show Password";
    }
  });
});
