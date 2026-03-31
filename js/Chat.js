const BackendUrl = "http://localhost:3000";
// const BackendUrl = "https://aitto-backend-production.up.railway.app";
let isUserAdmin = false;
let selectedConversationId = null;
let intervalId = null;
let userId = null;
let currentUserId = null;
let socket;
let socketStatusEl = null;
try {
  socket = io(BackendUrl, {
    withCredentials: true,
  });
} catch (error) {
  window.location.href = "login.html";
}

function showSocketStatus(message) {
  if (!socketStatusEl) {
    socketStatusEl = document.createElement("div");
    socketStatusEl.id = "socket-status";
    document.body.appendChild(socketStatusEl);
  }
  socketStatusEl.textContent = message;
}

function clearSocketStatus() {
  if (socketStatusEl) {
    socketStatusEl.remove();
    socketStatusEl = null;
  }
}

socket.on("connect", () => {
  console.log("Conectado:", socket.id);
  clearSocketStatus();
});

socket.on("connect_error", (err) => {
  showSocketStatus(
    `Falha na conexao do chat (${err?.message || "erro desconhecido"}). Tentando reconectar...`,
  );
});

socket.on("disconnect", () => {
  showSocketStatus("Conexao do chat perdida. Tentando reconectar...");
});

socket.io.on("reconnect_attempt", () => {
  showSocketStatus("Reconectando ao chat...");
});

socket.io.on("reconnect_failed", () => {
  showSocketStatus(
    "Nao foi possivel reconectar ao chat. Recarregue a pagina para tentar novamente.",
  );
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
  const preview = data?.messagePreview ?? "";
  const conversationId = data?.conversationId;

  AlertElement(`new message: ${preview}`, true)

  if (Notification.permission === "granted") {
    const notification = new Notification("Nova mensagem", {
      body: preview,
      tag: `conversation-${conversationId}`
    });

    notification.onclick = () => {
      window.focus();
    };
  }
  if (isUserAdmin && conversationId !== selectedConversationId) {
    showNotificationBadge(conversationId);
  }
});

socket.on("errorMessage", (err) => {
  console.log("Erro:", err);
  if (err === "Você está enviando mensagens muito rápido.") {
    AlertElement(err, false);
    setInterval(() => {
      window.location.href = "index.html";
    }, 3000);
    return;
  }
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

const textarea = document.getElementById("iMessage");

textarea.addEventListener("input", () => {
  textarea.style.height = "auto";

  const maxHeight = 150;
  const newHeight = Math.min(textarea.scrollHeight, maxHeight);
  textarea.style.height = newHeight + "px";

  const progress = Math.min(newHeight / maxHeight, 1);
  textarea.style.borderRadius = 20 - 12 * progress + "px";
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
          const badge = div.querySelector(".badge");
          if (badge) {
            badge.remove();
          }

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
        div.appendChild(badge);
      } else {
        badge.classList.remove("active");
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
    if (response.status === 429) {
      AlertElement("Please wait a moment", false);
    }
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
    if (response.status === 429) {
      AlertElement("Please wait a moment", false);
      return;
    }
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

  if (message.length >= 500) {
    AlertElement("this message is too long", false);
    return;
  }

  if (isUserAdmin) {
    if (!currentUserId) {
      AlertElement("select client first", false);
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
