const BackendUrl = "http://localhost:3000";
let isUserAdmin = null;

document.addEventListener("DOMContentLoaded", async (e) => {
  getCurrentUser();
  try {
    e.preventDefault();
    const response = await fetch(`${BackendUrl}/projects`, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    console.log(data);
    data.forEach((project) => {
      GenerateProjects(project.name, project.photo_url);
    });
  } catch (error) {
    alert("Error picking up projects, please try again later.");
    window.location.href = "index.html"
  }
});
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
async function getCurrentUser() {
  try {
    const response = await fetch(`${BackendUrl}/login/me`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Erro ao pegar usuário");
    const data = await response.json();
    if (data.role === "admin") {
      GenerateNewProjects();
    }
  } catch (err) {
    console.error(err);
  }
}
function GenerateNewProjects() {
  const section = document.querySelector("main");
  const div = document.createElement("div");
  div.classList.add("Add-btn");
  div.addEventListener("click",()=>{
    form.classList.toggle("active")
  })

  const AddIcon = document.createElement("span");
  AddIcon.classList.add("material-symbols-outlined");
  AddIcon.id = "add-icon";
  AddIcon.textContent = "add";
  div.appendChild(AddIcon);
  const form = document.createElement("form");
  form.id = "form";

  const buttonClose = document.createElement("button")
  buttonClose.classList.add("buttonClose")
  buttonClose.addEventListener("click",()=>{
    form.classList.toggle("active")
  })

  const IconButtonClose = document.createElement("span")
  IconButtonClose.classList.add("material-symbols-outlined")
  IconButtonClose.id = "close"
  IconButtonClose.textContent = "close"
  buttonClose.appendChild(IconButtonClose)

  const divName = document.createElement("div");
  divName.className = "Campo Name";

  const labelName = document.createElement("label");
  labelName.setAttribute("for", "inputName");
  labelName.textContent = "Name";

  const inputName = document.createElement("input");
  inputName.type = "text";
  inputName.name = "name";
  inputName.id = "inputName";
  inputName.required = true;

  divName.appendChild(labelName);
  divName.appendChild(inputName);
  const divFile = document.createElement("div");
  divFile.className = "Campo File";

  const inputFile = document.createElement("input");
  inputFile.type = "file";
  inputFile.name = "file";
  inputFile.id = "inputFile";
  inputFile.accept = "image/*";
  inputFile.required = true;
  inputFile.hidden = true;

  const labelFile = document.createElement("label");
  labelFile.setAttribute("for", "inputFile");
  labelFile.textContent = "Escolher imagem";
  labelFile.classList.add("custom-file-btn");

  const previewImg = document.createElement("img");
  previewImg.classList.add("PreviewImg");
  previewImg.style.display = "none"

  inputFile.addEventListener("change", () => {
    const file = inputFile.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        previewImg.src = e.target.result;
        previewImg.style.display = "block"
      };

      reader.readAsDataURL(file);
    } else {
      previewImg.style.display = "none";
    }
  });

  divFile.appendChild(inputFile);
  divFile.appendChild(labelFile);
  divFile.appendChild(previewImg);

  const button = document.createElement("button");
  button.type = "submit";
  button.id = "btn-submit";
  button.textContent = "submit";
  button.addEventListener("click",async(e)=>{
    e.preventDefault();
    const formData = new FormData(form)
    try{
      const response = await fetch(`${BackendUrl}/projects/create`,{
        method:"POST",
        credentials:"include",
        body:formData
      })
      const data = await response.json()
    }catch(erro){

    }
  })

  form.appendChild(buttonClose)
  form.appendChild(divName);
  form.appendChild(divFile);
  form.appendChild(button);

  section.appendChild(form);
  section.appendChild(div);
}

function GenerateProjects(name, photo_url) {
  const section = document.querySelector("main");
  const project = document.createElement("div");
  project.classList.add("bg-icon");

  const article = document.createElement("article");

  const divImg = document.createElement("div");
  const imgProject = document.createElement("img");
  imgProject.src = `${BackendUrl}${photo_url}`;
  imgProject.alt = name;
  divImg.classList.add("image");
  divImg.appendChild(imgProject);

  const divText = document.createElement("div");
  const nameProject = document.createElement("p");
  nameProject.textContent = name;
  divText.classList.add("texto");
  divText.appendChild(nameProject);

  article.appendChild(divImg);
  article.appendChild(divText);
  project.appendChild(article);

  section.appendChild(project);
}
function clickMenu() {
  const Menu = document.getElementById("itens");
  Menu.classList.toggle("active");
}
