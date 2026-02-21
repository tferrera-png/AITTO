const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

const BackendUrl = "http://localhost:3000";

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

function login() {
  const form = document.getElementById("form-login");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("iemail").value;
    const password = document.getElementById("ipass").value;

    const response = await fetch(`${BackendUrl}/login/sing-in`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    });
    const data = await response.json();
    if (response.ok) {
      alert("login feito com sucesso");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    }
    if (!response.ok) {
      alert(data);
    }
  });
}
function register() {
  const form = document.getElementById("form-register");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("irname").value;
    const email = document.getElementById("iremail").value;
    const password = document.getElementById("irpass").value;

    const response = await fetch(`${BackendUrl}/login/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      alert("register feito com sucesso");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    }
    if (!response.ok) {
      alert(data);
    }
  });
}
register();
login();
