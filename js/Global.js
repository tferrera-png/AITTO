const BackendUrl = "https://aitto-backend-production.up.railway.app";
function clickMenu() {
  const Menu = document.getElementById("itens");
  Menu.classList.toggle("active");
}

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

function UserInfo() {
  window.addEventListener("DOMContentLoaded", async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BackendUrl}/login/me`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        Login();
      } else {
        ShowInfoUser(data);
      }
    } catch (error) {
      AlertElement("Server error, please try again later", false);
    }
  });
}
function Login() {
  const itens = document.getElementById("itens");
  const ButtonLogin = document.createElement("button");
  ButtonLogin.textContent = "Login";
  ButtonLogin.classList.add("ButtonLogout");
  ButtonLogin.addEventListener("click", () => {
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  });
  itens.appendChild(ButtonLogin);
}
function ShowInfoUser(user) {
  const itens = document.getElementById("itens");
  const div = document.createElement("div");
  div.classList.add("UserInfo");

  const PUserInfo = document.createElement("a");
  PUserInfo.textContent = user.name;
  PUserInfo.classList.add("PUserInfo");

  const ButtonLogout = document.createElement("button");
  ButtonLogout.textContent = "Logout";
  ButtonLogout.classList.add("ButtonLogout");
  ButtonLogout.addEventListener("click", async () => {
    const response = await fetch(`${BackendUrl}/login/logout`, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    setTimeout(() => {
      location.reload();
    }, 3000);
  });

  div.appendChild(PUserInfo);
  div.appendChild(ButtonLogout);

  itens.appendChild(div);
}
UserInfo();
