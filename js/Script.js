const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

const BackendUrl = "https://aitto-backend-production.up.railway.app";

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

function AlertElement(message, type) {
  const divAlert = document.createElement("div");
  const buttonClose = document.createElement("button");

  if (type) {
    divAlert.classList.add("AlertElement");
    buttonClose.classList.add("AlertButtonElement");
  } else {
    divAlert.classList.add("AlertElement", "negative");
    buttonClose.classList.add("AlertButtonElement");
  }

  const messageAlert = document.createElement("p");
  messageAlert.textContent = message;

  buttonClose.textContent = "x";
  buttonClose.addEventListener("click", () => {
    divAlert.classList.toggle("active");
  });

  divAlert.appendChild(messageAlert);
  divAlert.appendChild(buttonClose);
  document.body.appendChild(divAlert);
}

function login() {
  const form = document.getElementById("form-login");

  form.addEventListener("submit", async (e) => {
    try {
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
        AlertElement("login feito com sucesso", true);
        const permitido = await pedirPermissaoNotificacao();

        console.log("Permissão notificação:", permitido);
        setTimeout(() => {
          window.location.href = "Contact.html";
        }, 1500);
      }
      if (!response.ok) {
        AlertElement("Erro ao realizar login", false);
      }
      if(!response){
        console.log("h")
      }
    } catch (error) {
      AlertElement("Login error, please try again later.", false);
    }
  });
}
function register() {
  const form = document.getElementById("form-register");
  form.addEventListener("submit", async (e) => {
    try {
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
        AlertElement("register feito com sucesso", true);
        const permitido = await pedirPermissaoNotificacao();

        console.log("Permissão notificação:", permitido);
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      }
      if (!response.ok) {
        AlertElement(data, false);
      }
    } catch (error) {
      AlertElement("Register error, please try again later.", false);
    }
  });
}
async function pedirPermissaoNotificacao() {
  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return Notification.permission === "granted";
}
register();
login();
