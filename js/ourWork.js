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
  const section = document.getElementById("Show-projects");
  const project = document.createElement("article");

  const divImg = document.createElement("div");
  const imgProject = document.createElement("img");
  imgProject.src = `${BackendUrl}${photo_url}`;
  imgProject.alt = name;
  divImg.classList.add("article");
  divImg.appendChild(imgProject);

  const divText = document.createElement("div");
  const nameProject = document.createElement("p");
  nameProject.textContent = name;
  divText.classList.add("texto");
  divText.appendChild(nameProject);

  project.appendChild(divImg);
  project.appendChild(divText);
  section.appendChild(project);
}
function clickMenu() {
  const Menu = document.getElementById("itens");
  Menu.classList.toggle("active");
}
