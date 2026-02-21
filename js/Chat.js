const BackendUrl = "http://localhost:3000";

function clickMenu() {
  const Menu = document.getElementById("itens");
  Menu.classList.toggle("active");
}

async function isAdmin() {
  try {
    const response = await fetch(`${BackendUrl}/chat/admin/conversations`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log(data);

    if (data.erro === "Access allowed only for admins") {
      return;
    }

    const chatContainer = document.getElementById("messages");

    const sliderBar = document.createElement("div");
    sliderBar.classList.add("sliderBar");

    sliderBar.innerHTML = `
  <div class="handle" onclick="openMenuConversation()"></div>
  <div class="sliderContent"></div>
`;
    const sliderContent = sliderBar.querySelector(".sliderContent");

    sliderContent.innerHTML = data
      .map(
        (conversations) => `
      <div class="conversation" onclick="GetMessagesOnAdmin(${conversations.id})">
        <p>${conversations.user_name}</p>
      </div>
    `,
      )
      .join("");

    document.querySelector("#page").appendChild(sliderBar);
  } catch (error) {
    console.error("Erro no fetch:", error);
  }
}

function openMenuConversation() {
  const menuSlider = document.querySelector(".sliderBar");
  if (menuSlider) {
    menuSlider.classList.toggle("active");
  }
}

async function GetMessagesOnAdmin(id) {
  try {
    const response = await fetch(`${BackendUrl}/chat/admin/${id}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar mensagens: ${response.status}`);
    }

    const data = await response.json();

    const chatContainer = document.getElementById("messages");

    chatContainer.innerHTML = data
      .map(
        (msg) => `
          <div class="${msg.sender_role === "admin" ? "message my" : "message"}">
            <div class="${msg.sender_role === "admin" ? "content my" : "content"}">
              <p>${msg.content}</p>
              <p>${msg.sender_name}</p>
            </div>
          </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Erro no fetch:", error);
  }
}

async function GetMessages() {
  try {
    const response = await fetch(`${BackendUrl}/chat`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar mensagens: ${response.status}`);
    }

    const data = await response.json();

    const chatContainer = document.getElementById("messages");

    chatContainer.innerHTML = data
      .map(
        (msg) => `
          <div class="${msg.sender_role === "admin" ? "message my" : "message"}">
            <div class="${msg.sender_role === "admin" ? "content my" : "content"}">
              <p>${msg.content}</p>
              <p>${msg.sender_name}</p>
            </div>
          </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Erro no fetch:", error);
  }
}

isAdmin();
