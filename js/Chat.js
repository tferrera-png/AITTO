const BackendUrl = "http://localhost:3000";
let isUserAdmin = false;
let selectedConversationId = null;
let intervalId = null;
let userId = null;
let currentUserId = null;
let socket;

try {
  socket = io("http://localhost:3000", {
    withCredentials: true,
  });
} catch (error) {
  window.location.href = "login.html";
}

socket.on("connect", () => {
  console.log("Conectado:", socket.id);
});

socket.on("receiveMessage", (data) => {
  console.log("Mensagem recebida:", data);

  if (
    (!isUserAdmin && data.conversationId === selectedConversationId) ||
    (isUserAdmin && data.conversationId === selectedConversationId)
  ) {
    if (isUserAdmin) {
      GetMessagesOnAdmin(selectedConversationId);
    } else {
      GetMessages();
    }
  }
});
socket.on("newMessageNotification", (data) => {
  alert("🔔 Nova mensagem recebida:", data);

  if (isUserAdmin && data.conversationId !== selectedConversationId) {
    showNotificationBadge(data.conversationId);
  }
});

socket.on("errorMessage", (err) => {
  console.log("Erro:", err);
});
const textarea = document.getElementById("iMessage");

textarea.addEventListener("input", () => {
  textarea.style.height = "auto";

  const maxHeight = 150;
  const newHeight = Math.min(textarea.scrollHeight, maxHeight);
  textarea.style.height = newHeight + "px";

  const progress = Math.min(newHeight / maxHeight, 1);
  textarea.style.borderRadius = 20 - (12 * progress) + "px";
});
textarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event("submit"));
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
    window.location.href = "login.html";
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

        div.dataset.id = conversation.id;

        div.addEventListener("click", () => {
          currentUserId = conversation.user_id;
          selectedConversationId = conversation.id;

          socket.emit("joinConversation", selectedConversationId);
          console.log("Conectado:", socket.id);
          GetMessagesOnAdmin(selectedConversationId);
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
function showNotificationBadge(conversationId) {
  const conversations = document.querySelectorAll(".conversation");

  conversations.forEach((div) => {
    if (parseInt(conversationId) === parseInt(div.dataset.id)) {
      let badge = div.querySelector(".badge");

      if (!badge) {
        badge = document.createElement("span");
        badge.classList.add("badge");
        badge.textContent = "1";
        div.appendChild(badge);
      } else {
        badge.textContent = parseInt(badge.textContent) + 1;
      }
    }
  });
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

    console.log(data);

    data.forEach((msg) => {
      const messageWrapper = document.createElement("div");
      messageWrapper.classList.add("message");

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("content");

      const isMine = msg.sender_id === userId;

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
    const { conversationId, messages } = data;

    selectedConversationId = conversationId;
    console.log("ConversationId do user:", conversationId);
    if (selectedConversationId) {
      socket.emit("joinConversation", selectedConversationId);
    }
    const chatContainer = document.getElementById("messages");
    chatContainer.innerHTML = "";

    console.log(messages);

    messages.forEach((msg) => {
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
const form = document.getElementById("form-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.getElementById("iMessage");
  const message = input.value.trim();

  if (!message) return;

  if(message.length >= 700){
    alert("this message is too long")
    return
  }

  if (isUserAdmin) {
    if (!currentUserId) {
      alert("select client first");
      return;
    }
    socket.emit("sendMessage", {
      currentUserId: currentUserId,
      message: message,
    });
  } else {
    socket.emit("sendMessage", {
      message: message,
    });
  }

  input.value = "";
  input.style.height = "auto";
  input.style.borderRadius = "20px";
});
