// Handle task selection
const taskForm = document.getElementById("taskForm");
let PrevQuizScore = -1
let prevPaper = []


loadContent();
taskForm.addEventListener("change", (event) => {
    loadContent();
});

function loadContent() {
    const selectedTask = document.querySelector(
        "input[name = 'task']:checked"
    ).value;
    switch (selectedTask) {
        case "qa":
            loadQAContent();
            break;
        case "flashcard":
            loadFlashcardContent();
            break;
        case "summary":
            loadSummaryContent();
            break;
        case "quiz":
            loadQuizContent();
            break;
    }
}

// Loading Specific Contents
function loadQAContent() {
    mainContent.innerHTML = `
            <h1 class="task-heading">Question Answering</h1>
             <div class="chat-box" id="chat-box">
              </div>
              <div class="input-box">
                  <label id="advance-label" for="check-advance">Advance Mode: <input type="checkbox" checked id="check-advance"></label>
                  <textarea type="text" id="user-input"  placeholder="Type your question here"></textarea>
                  <button onclick="sendMessage()">Send</button>
              </div>
        `;

    document
        .getElementById("user-input")
        .addEventListener("keydown", function (event) {
            if (event.key === "Enter" && !event.altKey) {
                this.style.height = "";
                event.preventDefault(); // Prevents the default Enter key behavior
                sendMessage();
            } else if (event.key === "Enter" && event.altKey) {
                // Insert a new line in the input field when Alt + Enter is pressed
                const cursorPosition = this.selectionStart;
                const textBeforeCursor = this.value.substring(0, cursorPosition);
                const textAfterCursor = this.value.substring(cursorPosition);
                this.value = textBeforeCursor + "\n" + textAfterCursor;
                this.selectionEnd = cursorPosition + 1; // Move the cursor to the next line
                this.style.height = this.scrollHeight + "px";
            }
        });
}

function loadFlashcardContent() {
    mainContent.innerHTML = `
          <h1 class="task-heading">Flashcard Generation</h1>
          <div class="flashcard-box" id="flashcard-box">
            <div id="flashcardCarousel" class="carousel slide">
              <div class="carousel-inner">
              </div>
               <button class="carousel-control-prev" type="button" data-bs-target="#flashcardCarousel"
                    data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#flashcardCarousel"
                    data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                </button>
            </div>
          </div>
          <div class="input-box">
              <textarea type="text" id="fc-topic-input"  placeholder="Enter any keywords or leave it empty for random cards"></textarea>
              <button onclick="generateFlashcards()">Generate</button>
          </div>
        `;

    document
        .getElementById("fc-topic-input")
        .addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.altKey) {
                event.preventDefault();
                generateFlashcards();
            }
        });
}

function loadSummaryContent() {
    mainContent.innerHTML = `
        <h1 class="task-heading">Summarization</h1>
        <div class="pdf-view">
            <p id="select-pdf-message">Select Pdf from sidebar</p>
            <iframe id="pdfViewer-summarization" src="Unit 2.pdf" type="application/pdf"> </iframe>
        </div>
        <textarea placeholder="paste text to summarize from the pdf" id="long-content"></textarea>
        <button onclick="summarize()" class="summarize-btn">Summarize Given Part</button>
        <button onclick="summarize_pdf()" class="summarize-btn">Summarize Entire PDF</button>
        <p id="summary"></p>
      `;
}

function loadQuizContent() {
    mainContent.innerHTML = `
            <h1 class="task-heading">Quiz</h1>
            <div class="quiz-container">
              <button onclick=createQuiz() id="start-btn">Start Quiz</button> 
            </div>
        `;
}

// Function that can parse AI generated JSON string that can be messy
function parseJson(inputString) {
    // Match either a JSON array or a single JSON object
    let jsonString = inputString.match(/\{.*\}|\[.*\]/s);

    if (!jsonString) {
        console.error("No valid JSON object or array found in the input.");
        return null;
    }

    jsonString = jsonString[0];

    // Clean up the JSON string
    let cleanedString = jsonString
        .replace(/(\r\n|\n|\r)/gm, "")      // Remove newline characters
        .replace(/,\s*(\}|\])/g, "$1")      // Remove trailing commas before closing braces/brackets
        .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Add quotes around keys
        .replace(/,\s*]/g, "]")             // Remove trailing commas before closing brackets
        .trim();                            // Trim any extra spaces

    let jsonObject;
    try {
        jsonObject = JSON.parse(cleanedString);
    } catch (error) {
        console.error("Error parsing JSON: ", error);
        return null;
    }

    return jsonObject;
}