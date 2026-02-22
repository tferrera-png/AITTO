const BackendUrl = "http://localhost:3000";
let isUserAdmin = false;
let selectedConversationId = null;
let intervalId = null;
let userId = null;
let currentUserId = null;

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    stopAutoUpdate();
  } else {
    startAutoUpdate();
  }
});
async function getCurrentUser() {
  try {
    const response = await fetch(`${BackendUrl}/login/me`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Erro ao pegar usuário");
    const data = await response.json();
    userId = data.id;
  } catch (err) {
    console.error(err);
    window.location.href = "login.html"
  }
}
getCurrentUser().then(() => {
  isAdmin();
});

function clickMenu() {
  const Menu = document.getElementById("itens");
  Menu.classList.toggle("active");
}

async function isAdmin() {
  try {
    const response = await fetch(`${BackendUrl}/chat/admin/conversations`, {
      method: "GET",
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = "login.html";
      return;
    }
    if (response.status === 403) {
      isUserAdmin = false;
      GetMessages();
      startAutoUpdate();
      return;
    }
    if (!response.ok) {
      throw new Error("Erro ao verificar admin");
    }

    isUserAdmin = true;

    const data = await response.json();
    console.log("Admin confirmado:", data);

    if (data.erro === "Access allowed only for admins") {
      GetMessages();
    } else {
      isUserAdmin = true;
      const chatContainer = document.getElementById("messages");

      const sliderBar = document.createElement("div");
      sliderBar.classList.add("sliderBar");

      const handle = document.createElement("div");
      handle.classList.add("handle");
      handle.addEventListener("click", openMenuConversation);

      const sliderContent = document.createElement("div");
      sliderContent.classList.add("sliderContent");

      sliderBar.appendChild(handle);
      sliderBar.appendChild(sliderContent);

      sliderContent.innerHTML = "";

      data.forEach((conversation) => {
        const div = document.createElement("div");
        div.classList.add("conversation");

        div.addEventListener("click", () => {
          stopAutoUpdate();
          currentUserId = conversation.user_id;
          selectedConversationId = conversation.id;
          GetMessagesOnAdmin(selectedConversationId);
          startAutoUpdate();
        });

        const p = document.createElement("p");
        p.textContent = conversation.user_name;

        div.appendChild(p);
        sliderContent.appendChild(div);
      });
      document.querySelector("#page").appendChild(sliderBar);
    }
  } catch (error) {
    console.error(error);
    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      window.location.href = "login.html";
    }
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
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok)
      throw new Error(`Erro ao buscar mensagens: ${response.status}`);

    const data = await response.json();
    const chatContainer = document.getElementById("messages");
    chatContainer.innerHTML = "";

    data.forEach((msg) => {
      const messageWrapper = document.createElement("div");
      messageWrapper.classList.add("message");

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("content");

      const isMine =
        (!isUserAdmin && msg.sender_id === userId) ||
        (isUserAdmin && msg.sender_id === currentUserId);

      if (!isMine) {
        messageWrapper.classList.add("my");
        contentDiv.classList.add("my");
      }

      const messageText = document.createElement("p");
      messageText.textContent = msg.content;

      const senderName = document.createElement("p");
      const date = new Date(msg.created_at);
      const formatted = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      senderName.textContent = formatted;

      contentDiv.appendChild(messageText);
      contentDiv.appendChild(senderName);
      messageWrapper.appendChild(contentDiv);
      chatContainer.appendChild(messageWrapper);
    });
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  } catch (error) {
    console.error("Erro no fetch:", error);
  }
}

async function GetMessages() {
  try {
    const response = await fetch(`${BackendUrl}/chat`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok)
      throw new Error(`Erro ao buscar mensagens: ${response.status}`);

    const data = await response.json();
    const chatContainer = document.getElementById("messages");
    chatContainer.innerHTML = "";

    data.forEach((msg) => {
      const messageWrapper = document.createElement("div");
      messageWrapper.classList.add("message");

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("content");

      if (msg.sender_id === userId) {
        messageWrapper.classList.add("my");
        contentDiv.classList.add("my");
      }

      const messageText = document.createElement("p");
      messageText.textContent = msg.content;

      const senderName = document.createElement("p");
      const date = new Date(msg.created_at);
      const formatted = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // 24h
      });
      senderName.textContent = formatted;

      contentDiv.appendChild(messageText);
      contentDiv.appendChild(senderName);
      messageWrapper.appendChild(contentDiv);
      chatContainer.appendChild(messageWrapper);
    });

    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  } catch (error) {
    console.error("Erro no fetch:", error);
  }
}

async function SendMessageUser(message) {
  try {
    const response = await fetch(`${BackendUrl}/chat/send`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("Erro ao enviar mensagem");
    }

    const data = await response.json();
    console.log("Mensagem enviada:", data);

    GetMessages();
  } catch (error) {
    console.error("Erro:", error);
  }
}
async function SendMessageAdmin(conversation_id, message) {
  try {
    const response = await fetch(
      `${BackendUrl}/chat/admin/send/${conversation_id}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      },
    );

    if (!response.ok) {
      throw new Error("Erro ao enviar mensagem");
    }

    const data = await response.json();
    console.log("Mensagem enviada:", data);
  } catch (error) {
    console.error("Erro:", error);
  }
}
const form = document.getElementById("form-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.getElementById("iMessage");
  const message = input.value.trim();

  if (!message) return;

  if (isUserAdmin) {
    SendMessageAdmin(currentUserId, message);
  } else {
    SendMessageUser(message);
  }

  input.value = "";
});
function startAutoUpdate() {
  if (intervalId !== null) return;

  intervalId = setInterval(() => {
    if (document.visibilityState === "visible") {
      if (isUserAdmin && selectedConversationId) {
        GetMessagesOnAdmin(selectedConversationId);
      } else if (!isUserAdmin) {
        GetMessages();
      }
    }
  }, 3000);
}

function stopAutoUpdate() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
