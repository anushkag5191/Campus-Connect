const searchInput = document.querySelector(".forum-controls input");
const tabs = document.querySelectorAll(".tabs span");
const questions = document.querySelectorAll(".question-card");

searchInput.addEventListener("keyup", function () {
  const value = this.value.toLowerCase();

  questions.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(value) ? "flex" : "none";
  });
});

// Category filter
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const category = tab.innerText.toLowerCase();

    questions.forEach(card => {
      const badge = card.querySelector(".badge").innerText.toLowerCase();

      if (category === "all" || badge.includes(category)) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  });
});

// Ask Question
document.querySelector(".btn-primary").addEventListener("click", () => {
  const title = prompt("Enter your question");
  const category = prompt("Enter category (career, academic, campus life)");

  if (!title || !category) return;

  const card = document.createElement("div");
  card.className = "question-card";

  card.innerHTML = `
    <div class="avatar">U</div>
    <div class="question-content">
      <h3>${title}</h3>
      <p class="meta">You • Just now</p>
      <p class="desc">No description</p>
      <div class="tags">
        <span class="badge purple">${category}</span>
        <span class="answers">💬 0 answers</span>
      </div>
    </div>
  `;

  document.querySelector(".questions").prepend(card);
});
