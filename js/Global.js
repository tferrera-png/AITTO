const BackendUrl = "http://localhost:3000";
function clickMenu() {
  const Menu = document.getElementById("itens");
  Menu.classList.toggle("active");
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
      alert("Server error, please try again later");
    }
  });
}
function Login() {
  const itens = document.getElementById("itens");
  const ButtonLogin = document.createElement("button");
  ButtonLogin.textContent = "Login";
  ButtonLogin.classList.add("ButtonLogout");
  ButtonLogin.addEventListener("click",()=>{
    setTimeout(() => {
      window.location.href = "login.html"
    }, 2000);
  })
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
