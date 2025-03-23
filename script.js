let rotation = 0;
let isFrontVisible = true;

function rotateCircle() {
  rotation += 180;
  isFrontVisible = !isFrontVisible;
  document.querySelector(
    ".circle-container"
  ).style.transform = `rotateY(${rotation}deg)`;
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
