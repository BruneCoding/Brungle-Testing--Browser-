console.log("version 1.1.3");

// DOM Elements
const searchBar = document.querySelector(".searchBar");
const paperClip = document.querySelector(".fa-paperclip");
let uploadedImage = null;

// Voice Recognition
document.querySelector(".fa-microphone").addEventListener("click", function () {
  const searchInput = document.getElementById("query");
  const searchBar = document.querySelector(".searchBar");
  const microPhone = document.querySelector(".fa-microphone");

  if ("webkitSpeechRecognition" in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function () {
      searchInput.placeholder = "Listening...";
      console.log("user in listening mode.");
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
      searchInput.placeholder =
        "random bug flew into code and caused a error in recognition: " +
        event.error;
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
    searchInput.placeholder =
      "Your device is so old, that even voice recognition ( cerca 2017 ) is not supported. i truly feel sorry... ig its time to beg parents?";
    setTimeout(() => {
      searchInput.placeholder = "Search Brungle...";
    }, 3000);
  }
});

// Image Upload
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
    alert("Unsupported Search Engine. Try Google");
  }
});

// Remove Image
document.getElementById("removeImageBtn")?.addEventListener("click", () => {
  uploadedImage = null;
  document.getElementById("imagePreviewContainer").style.display = "none";
});

// Show Image Preview
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

// Search Functionality
document.getElementById("query").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = encodeURIComponent(this.value.trim());

    if (isFrontVisible) {
      if (query)
        window.location.href = `https://testing-bruh-brungle.pages.dev/#${query}`;
    } else {
      if (uploadedImage) {
        handleImageSearch(query);
      } else if (query) {
        window.location.href = `https://www.google.com/search?q=${query}`;
      }
    }
  }
});

// Improved Image Search Function
function handleImageSearch(textQuery = "") {
  if (!uploadedImage) return;

  // Create a form to submit to Google Lens
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `https://lens.google.com/upload?ep=ccm${textQuery ? `&st=${encodeURIComponent(textQuery)}` : ''}`;
  form.enctype = 'multipart/form-data';
  form.target = '_blank';
  
  // Create file input with our image
  const input = document.createElement('input');
  input.type = 'file';
  input.name = 'encoded_image';
  
  // Use DataTransfer to set the file
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(uploadedImage);
  input.files = dataTransfer.files;
  
  // Submit the form
  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
  
  // Clean up
  document.getElementById("imagePreviewContainer").style.display = "none";
  uploadedImage = null;
}

// 3D Flip Animation and State Management
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

request.onerror = function (e) {
  console.error("DB Error:", e);
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

// Sparkle Animation
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

// Secret Key Combination
const pressedKeys = new Set();

document.addEventListener("keydown", (e) => {
  pressedKeys.add(e.key.toUpperCase());
  if (
    pressedKeys.has("E") &&
    pressedKeys.has("F") &&
    pressedKeys.has("G") &&
    pressedKeys.has("H")
  ) {
    deleteState();
    console.log("State deleted");
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
