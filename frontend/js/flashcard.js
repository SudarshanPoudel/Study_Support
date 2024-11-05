// Flashcard Service
function getRandomColor() {
    const r = Math.floor(Math.random() * 100);
    const g = Math.floor(Math.random() * 100);
    const b = Math.floor(Math.random() * 100);

    const color = `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

    return color;
}

function generateFlashcards() {
    let topicInput = document.getElementById("fc-topic-input");
    let topic = topicInput.value;
    const flashcardBox = document.querySelector(".carousel-inner");
    flashcardBox.innerHTML = `<div class="carousel-item active">
          <div class="card p-4" style="background-color: ${getRandomColor()};">
              <p class="card-text">Wait a while! <br>Flashcards are being generated...</p>
          </div>
        </div>`;
    fetch("http://127.0.0.1:5000/flashcard", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: topic }),
    })
        .then((response) => response.json())
        .then((data) => {
            flashcardBox.innerHTML = `<div class="carousel-item active">
          <div class="card p-4" style="background-color: ${getRandomColor()};">
              <p class="card-text">${topic || "Flashcards"}.<br> >>></p>
          </div>
        </div>`;
            content = parseJson("[" + data.response + "]");
            content.forEach((card, index) => {
                color = getRandomColor()
                flashcardBox.innerHTML += `
          <div class="carousel-item">
            <div class="card p-4" style="background-color: ${color};">
                <p class="flashcard-no">${index + 1}</p>
                <p class="card-text">${card.Front.replace('\n', '<br>')}</p>
            </div>
          </div>
          <div class="carousel-item">
            <div class="card p-4">
                <p class="flashcard-no">${index + 1}</p>
                <p class="card-text">${card.Back}</p>
            </div>
          </div>
          `;
            });
        })
        .catch((error) => {
            flashcardBox.innerHTML = `<div class="carousel-item active">
            <div class="card p-4" style="background-color: #440000;">
                <p class="card-text">Error! Something wrong happening in AI World.</p>
            </div>
          </div>`;
        });

    // Clear input field
    topicInput.value = "";
}
