document.addEventListener('DOMContentLoaded', function() {

console.log("test")
alert("test")

const searchBar = document.querySelector(".searchBar");
const paperClip = document.querySelector(".fa-paperclip");
let uploadedImage = null;

document.querySelector(".fa-microphone").addEventListener("click", function () {
  const searchInput = document.getElementById("query");
  const microPhone = document.querySelector(".fa-microphone");

  if ("webkitSpeechRecognition" in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function () {
      searchInput.placeholder = "Listening...";
      microPhone.style.color = "rgb(178,121,255)";
      microPhone.style.scale = "1.2";
      searchBar.classList.add("searchBar-active");
    };

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      searchInput.value = transcript;
      searchInput.placeholder = "Search Brungle...";
      microPhone.style.color = "#eaeaea";
      microPhone.style.scale = "1";
      searchBar.classList.remove("searchBar-active");
    };

    recognition.onerror = function (event) {
      searchInput.placeholder = "Error: " + event.error;
      setTimeout(() => {
        searchInput.placeholder = "Search Brungle...";
      }, 3000);
      searchBar.classList.remove("searchBar-active");
    };

    recognition.onend = function () {
      searchInput.placeholder = "Search Brungle...";
      searchBar.classList.remove("searchBar-active");
    };

    recognition.start();
  } else {
    searchInput.placeholder = "Voice search not supported";
    setTimeout(() => {
      searchInput.placeholder = "Search Brungle...";
    }, 3000);
  }
});

paperClip.addEventListener("click", function () {
  if (!isFrontVisible) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = false;

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        uploadedImage = file;
        showImagePreview(file);
      }
    };
    fileInput.click();
  } else {
    alert("Image search only available in Google mode");
  }
});

document.getElementById("removeImageBtn")?.addEventListener("click", () => {
  uploadedImage = null;
  document.getElementById("imagePreviewContainer").style.display = "none";
});

function showImagePreview(file) {
  const previewContainer = document.getElementById("imagePreviewContainer");
  const previewImg = document.getElementById("uploadedImagePreview");

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewContainer.style.display = "block";
  };
  reader.readAsDataURL(file);
}

document.getElementById("query").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = this.value.trim();

    if (isFrontVisible) {
      if (query)
        window.location.href = `https://testing-bruh-brungle.pages.dev/#${encodeURIComponent(
          query
        )}`;
    } else {
      if (uploadedImage) {
        handleImageSearch(query);
      } else if (query) {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(
          query
        )}`;
      }
    }
  }
});

function handleImageSearch(textQuery = "") {
  if (!uploadedImage) return;

  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://lens.google.com/upload";
  form.enctype = "multipart/form-data";
  form.target = "_blank";
  form.style.display = "none";

  const epInput = document.createElement("input");
  epInput.type = "hidden";
  epInput.name = "ep";
  epInput.value = "ccm";
  form.appendChild(epInput);

  if (textQuery) {
    const stInput = document.createElement("input");
    stInput.type = "hidden";
    stInput.name = "st";
    stInput.value = textQuery;
    form.appendChild(stInput);
  }

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.name = "encoded_image";

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(uploadedImage);
  fileInput.files = dataTransfer.files;
  form.appendChild(fileInput);

  document.body.appendChild(form);
  form.submit();

  setTimeout(() => {
    document.body.removeChild(form);
    document.getElementById("imagePreviewContainer").style.display = "none";
    uploadedImage = null;
  }, 1000);
}

let rotation = 0;
let isFrontVisible = true;
let db;
const request = indexedDB.open("ToggleDB", 1);

request.onupgradeneeded = function (e) {
  db = e.target.result;
  db.createObjectStore("state", { keyPath: "id" });
};

request.onsuccess = function (e) {
  db = e.target.result;
  loadState();
};

function saveState() {
  const tx = db.transaction("state", "readwrite");
  const store = tx.objectStore("state");
  store.put({ id: 1, isFrontVisible, rotation });
}

function loadState() {
  const tx = db.transaction("state", "readonly");
  const store = tx.objectStore("state");
  const getReq = store.get(1);
  getReq.onsuccess = () => {
    if (getReq.result) {
      isFrontVisible = getReq.result.isFrontVisible;
      rotation = getReq.result.rotation;
      document.querySelector(
        ".circle-container"
      ).style.transform = `rotateY(${rotation}deg)`;
    }
  };
}

function rotateCircle() {
  rotation += 180;
  isFrontVisible = !isFrontVisible;
  document.querySelector(
    ".circle-container"
  ).style.transform = `rotateY(${rotation}deg)`;
  saveState();
  createSparkles();
}

function createSparkles() {
  const container = document.querySelector(".circle-container");
  for (let i = 0; i < 10; i++) {
    const sparkle = document.createElement("div");
    sparkle.classList.add("sparkle");
    sparkle.style.left = `${Math.random() * 120}px`;
    sparkle.style.top = `${Math.random() * 120}px`;
    container.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  }
}

const pressedKeys = new Set();

document.addEventListener("keydown", (e) => {
  pressedKeys.add(e.key.toUpperCase());
  if (
    pressedKeys.has("e") &&
    pressedKeys.has("F") &&
    pressedKeys.has("G") &&
    pressedKeys.has("H")
  ) {
    deleteState();
    console.log("State reset");
  }
});

document.addEventListener("keyup", (e) => {
  pressedKeys.delete(e.key.toUpperCase());
});

function deleteState() {
  const tx = db.transaction("state", "readwrite");
  const store = tx.objectStore("state");
  store.delete(1);
}

// messages for NodeChat
const chatMenu = document.querySelector(".chat-menu");
const chatButton = document.querySelector(".chat-button");
const messagesContainer = document.getElementById("messages-container");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");
const closeBtn = document.querySelector(".close-btn");

const API_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCabBCysAE2M7-0DdmXa62VMfE61Js6714";

let chatHistory = JSON.parse(localStorage.getItem("nodeChatHistory")) || [];

function initChat() {
  messagesContainer.innerHTML = "";

  if (chatHistory.length === 0) {
    const initialMessage = {
      role: "bot",
      content: "Hello! How can I help you today?"
    };
    chatHistory.push(initialMessage);
    saveChatHistory();
  }

  chatHistory.forEach((message) => {
    displayMessage(message.role, message.content);
  });

  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 100);
}

function displayMessage(role, content) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role === "user" ? "user-message" : ""}`;

  if (role === "bot") {
    messageDiv.innerHTML = formatAISummary(content);
  } else {
    messageDiv.textContent = content;
  }

  messagesContainer.appendChild(messageDiv);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatAISummary(text) {
  return text
    .replace(/\*(.*?)\*/g, "<b>$1</b>")
    .replace(/_(.*?)_/g, "<u>$1</u>")
    .replace(/\^(.*?)\^/g, "<i>$1</i>")
    .replace(/\/new\//g, "<br><br>");
}

function saveChatHistory() {
  localStorage.setItem("nodeChatHistory", JSON.stringify(chatHistory));
}

async function sendMessageToAI(message) {
  try {
    typingIndicator.style.display = "block";
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const conversationHistory = chatHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    conversationHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    const prompt = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Your name is NodeChat+ and you are a ai assitant / chatbot. whenever you say you are a ai assistant, say i am [Brungle] NodeChat+ Answer this in a very friendly tone(doesnt need to be a quesiton)! You're an AI assistant / chatbot. 
              you do not need a question to answer. just talk basically and try answering their question if they have one. if not, engage friendly in a conversation :D
                                    Your job is to help the user in a slightly childish but still informative and helpful way. 
                                    Be like a fun mix of Grok X and a curious assistant. Keep it short, max 100 words.

Start by answering the query clearly in the first sentence, followed by a second short sentence. These two should be in the same paragraph. After that, write a new paragraph starting with /new/ (two line breaks).

Use ONLY these formatting markers:
- *word* → bold
- _word_ → underline
- ^word^ → italic

⚠️ DO NOT use HTML tags like <b>, <u>, <br>, etc. 
⚠️ DO NOT use Markdown-style **double asterisks** for bold.

Only use *word* for important stats or keywords like *3.9 billion* — never for full paragraphs.

If the query is a math problem, make the FIRST sentence fully bold using *...*.

still try to use bold but dont over do it!

Add fun emojis like ✨, 🤯, 🥳 where relevant, but don't overdo it.

dont say oops you dont have a question or smth. ignore it.

Also, if the user types in Clear Chat or anything similar to that, requesting chat history to be cleared, ignore the previous conversation.
Here's our conversation so far:`
            },
            ...conversationHistory.map((msg) => ({
              text: `${msg.role}: ${msg.parts[0].text}`
            }))
          ]
        }
      ]
    };

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(prompt)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    let aiResponse = data.candidates[0].content.parts[0].text;

    aiResponse = aiResponse.replace(/^model:\s*/i, "").trim();

    return aiResponse;
  } catch (error) {
    console.error("Error calling AI API:", error);
    return "Oops! Something went wrong. Please try again later. 🫠";
  } finally {
    typingIndicator.style.display = "none";
  }
}

async function handleSend() {
  const message = messageInput.value.trim();
  if (!message) return;

  displayMessage("user", message);
  chatHistory.push({
    role: "user",
    content: message
  });
  saveChatHistory();

  messageInput.value = "";

  const aiResponse = await sendMessageToAI(message);

  displayMessage("bot", aiResponse);
  chatHistory.push({
    role: "bot",
    content: aiResponse
  });
  saveChatHistory();
}

sendButton.addEventListener("click", handleSend);

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSend();
  }
});

chatButton.addEventListener("click", () => {
  console.log("clicked 1")
  chatMenu.style.visibility = "visible";
  chatMenu.style.marginLeft = "20px";
  chatButton.style.visibility = "hidden";
  console.log("NodeChat+ has been opened.");
});

closeBtn.addEventListener("click", () => {
    console.log("clicked 2")
  chatButton.style.visibility = "visible";
  chatMenu.style.marginLeft = "-365px";
  console.log("NodeChat+ has been closed");
});

initChat();
//
});
