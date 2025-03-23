console.log("Version 0.1.4");
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
