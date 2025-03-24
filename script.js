console.log("version 1.1.0");

const searchBar = document.querySelector(".searchBar");

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
      microPhone.style.color = "#d7c6ee";
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

//code

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

document.getElementById("query").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = encodeURIComponent(this.value.trim());
    if (query) {
      if (isFrontVisible) {
        window.location.href = `https://testing-bruh-brungle.pages.dev/#${query}`;
      } else {
        window.location.href = `https://www.google.com/search?q=${query}`;
      }
    }
  }
});

function deleteState() {
  const tx = db.transaction("state", "readwrite");
  const store = tx.objectStore("state");
  store.delete(1);
}
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
