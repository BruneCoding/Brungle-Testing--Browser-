// DOM Elements
const searchBar = document.querySelector(".searchBar");
const paperClip = document.querySelector(".fa-paperclip");
const microphone = document.querySelector(".fa-microphone");
const searchInput = document.getElementById("query");
const searchForm = document.getElementById("search-form");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const uploadedImagePreview = document.getElementById("uploadedImagePreview");
const removeImageBtn = document.getElementById("removeImageBtn");
const circleContainer = document.querySelector(".circle-container");

// Chat elements
const chatMenu = document.querySelector(".chat-menu");
const chatButton = document.querySelector(".chat-button");
const messagesContainer = document.getElementById("messages-container");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");
const closeBtn = document.querySelector(".close-btn");

// State variables
let uploadedImage = null;
let rotation = 0;
let isFrontVisible = true;
let db;
let chatHistory = JSON.parse(localStorage.getItem("nodeChatHistory")) || [];

// Initialize IndexedDB
const request = indexedDB.open("ToggleDB", 1);

request.onupgradeneeded = function(e) {
    db = e.target.result;
    db.createObjectStore("state", { keyPath: "id" });
};

request.onsuccess = function(e) {
    db = e.target.result;
    loadState();
};

// Functions
function saveState() {
    if (!db) return;
    
    const tx = db.transaction("state", "readwrite");
    const store = tx.objectStore("state");
    store.put({ id: 1, isFrontVisible, rotation });
}

function loadState() {
    if (!db) return;
    
    const tx = db.transaction("state", "readonly");
    const store = tx.objectStore("state");
    const getReq = store.get(1);
    
    getReq.onsuccess = () => {
        if (getReq.result) {
            isFrontVisible = getReq.result.isFrontVisible;
            rotation = getReq.result.rotation;
            circleContainer.style.transform = `rotateY(${rotation}deg)`;
        }
    };
}

function rotateCircle() {
    rotation += 180;
    isFrontVisible = !isFrontVisible;
    circleContainer.style.transform = `rotateY(${rotation}deg)`;
    saveState();
    createSparkles();
}

function createSparkles() {
    for (let i = 0; i < 10; i++) {
        const sparkle = document.createElement("div");
        sparkle.classList.add("sparkle");
        sparkle.style.left = `${Math.random() * 120}px`;
        sparkle.style.top = `${Math.random() * 120}px`;
        circleContainer.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 800);
    }
}

// Voice search functionality
microphone.addEventListener("click", handleVoiceSearch);

function handleVoiceSearch() {
    if (!("webkitSpeechRecognition" in window)) {
        searchInput.placeholder = "Voice search not supported";
        setTimeout(() => {
            searchInput.placeholder = "Search Brungle...";
        }, 3000);
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        searchInput.placeholder = "Listening...";
        microphone.style.color = "rgb(178,121,255)";
        microphone.style.scale = "1.2";
        searchBar.classList.add("searchBar-active");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        searchInput.placeholder = "Search Brungle...";
        microphone.style.color = "#eaeaea";
        microphone.style.scale = "1";
        searchBar.classList.remove("searchBar-active");
    };

    recognition.onerror = (event) => {
        searchInput.placeholder = "Error: " + event.error;
        setTimeout(() => {
            searchInput.placeholder = "Search Brungle...";
        }, 3000);
        searchBar.classList.remove("searchBar-active");
    };

    recognition.onend = () => {
        searchInput.placeholder = "Search Brungle...";
        searchBar.classList.remove("searchBar-active");
    };

    recognition.start();
}

// Image upload functionality
paperClip.addEventListener("click", handleImageUpload);

function handleImageUpload() {
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
}

function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImagePreview.src = e.target.result;
        imagePreviewContainer.style.display = "block";
    };
    reader.readAsDataURL(file);
}

removeImageBtn?.addEventListener("click", () => {
    uploadedImage = null;
    imagePreviewContainer.style.display = "none";
});

// Search functionality
searchForm.addEventListener("submit", handleSearch);

function handleSearch(e) {
    e.preventDefault();
    const query = searchInput.value.trim();

    if (isFrontVisible) {
        if (query) {
            window.location.href = `https://testing-bruh-brungle.pages.dev/#${encodeURIComponent(query)}`;
        }
    } else {
        if (uploadedImage) {
            handleImageSearch(query);
        } else if (query) {
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
    }
}

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
        imagePreviewContainer.style.display = "none";
        uploadedImage = null;
    }, 1000);
}

// Chat functionality
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

        const prompt = {
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `Answer this in a very friendly tone! Your name is Brungle NodeChat+ ! Here are some requirements you need to follow: 1. Word count ==> less than 70 words unless the user wants something that needs to be bigger, like code, someone's biography. Only go higher than 70 words if you deem fit for the response. 2.This is some code for a formatter in this project ai assistant app: .replace(/\*(.*?)\*/g, "<b>$1</b>")
        .replace(/_(.*?)_/g, "<u>$1</u>")
        .replace(/\^(.*?)\^/g, "<i>$1</i>")
        .replace(/\/new\//g, "<br><br>"); basically you need to bold and stuff. Start by answering the query clearly in the first sentence, followed by a second short sentence ( only if the query is something that can be short. for example, if it is a biography or something longer than 70 words, ignore this ). These two should be in the same paragraph. After that, write a new paragraph starting with /new/ (two line breaks). Use ONLY these formatting markers:
- *word* → bold
- _word_ → underline
- ^word^ → italic 
Only use *word* for important stats or keywords like *3.9 billion* — never for full paragraphs.

If the query is a math problem, make the FIRST sentence fully bold using *...*.

Add fun emojis like ✨, 🤯, 🥳 where relevant, but don’t overdo it. Also make sure to greet the user very nicely. Act like your the user friend. Your job is to be very supportive and helpful, helping them with all their troubles or just chatting with them. Moreover, make sure to remember past messages the user has sent, so you can fully understand the conversation! here is a example of a good enough response: Hello! I'm Brungle NodeChat+, and I'm here to help you! I'm excited to chat with you today! 🥳

Let's have some fun! What do you want to talk about? Maybe we can explore the mysterious world of fluffy kittens or the exciting planet Jupiter! Tell me your ideas! ✨ Ok here is the message the user has sent you... make sure to answer it to the point and super super friendly! :  ${message}`
                        }
                    ]
                }
            ]
        };

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCabBCysAE2M7-0DdmXa62VMfE61Js6714", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(prompt)
        });

        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

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

// Event Listeners
sendButton.addEventListener("click", handleSend);
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
});

chatButton.addEventListener("click", () => {
    chatMenu.style.visibility = "visible";
    chatMenu.style.marginLeft = "20px";
    chatButton.style.visibility = "hidden";
});

closeBtn.addEventListener("click", () => {
    chatButton.style.visibility = "visible";
    chatMenu.style.marginLeft = "-365px";
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    console.log("%cBeta Version. [v1.1.6] Pre Roll 2", "color: #FF5733; font-size: 16px; font-weight: bold;");
    console.log("%cUpdated Features:", "color: #3498DB; font-size: 14px; font-weight: bold;");
    console.log("%c==> Fixed AI History issues.", "color: #2ECC71; font-size: 13px;");
      console.log("%c==> Fixed AI Prompt and Training Data Issues", "color: #2ECC71; font-size: 13px;");
    
    initChat();
});
