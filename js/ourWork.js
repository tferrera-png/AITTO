const BackendUrl = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", async (e) => {
  e.preventDefault();
  const response = await fetch(`${BackendUrl}/projects`, {
    method: "GET",
    credentials: "include",
  });
  const data = await response.json();
  console.log(data);
  data.forEach((project) => {
    GenerateProjects(project.id, project.name, project.photo_url);
  });
});

function GenerateProjects(id, name, photo_url) {
  const section = document.querySelector("main");
  const project = document.createElement("div");
  project.classList.add("bg-icon")

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
