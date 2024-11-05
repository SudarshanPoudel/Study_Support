// Quiz Service
function createQuiz(givenQuestions) {
    document.querySelector('.quiz-container').innerHTML = `
      <h3 id="question-number">QUESTION 1</h3>
      <div class="quiz-box">
          <p class="question" id="question-text"></p>
          <div class="options" id="options-container">
          </div>
      </div>
      <div class="quiz-btns">
          <button id="previous-btn" disabled>Previous</button>
          <button id="next-btn">Next</button>
          <button id="submit-btn" style="display: none;">Submit</button>
      </div>
    `
    let paper = givenQuestions
    if (!paper) {
      document.querySelector('.question').innerHTML = "Wait, Quiz is being generated..."
      document.querySelector('#question-number').style.display = 'none'
      document.querySelector('.quiz-btns').style.display = 'none'
      fetch("http://127.0.0.1:5000/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({prevScore : PrevQuizScore, prevQuiz : prevPaper})
      })
        .then((response) => response.json())
        .then((data) => {
  
          let paper = parseJson(data.response)
          document.querySelector('#question-number').style.display = 'block'
          document.querySelector('.quiz-btns').style.display = 'block'
          generateQuiz(paper);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }else{
      generateQuiz(paper);
    }
  }
  
  function generateQuiz(paper) {
    paper = paper.map(item => { return { ...item, "Selected": -1 } })
    let currentQuestion = 0;
    displayQuestion(paper[currentQuestion])
  
    document.getElementById('next-btn').addEventListener('click', () => {
      checkAnswer()
      if (currentQuestion === paper.length - 1) {
        submitQuiz(paper)
      } else {
        currentQuestion++
        displayQuestion(paper[currentQuestion])
        checkButtonEnable()
      }
    })
  
    document.getElementById('previous-btn').addEventListener('click', () => {
      currentQuestion--
      displayQuestion(paper[currentQuestion])
      checkButtonEnable()
    })
  
    function checkAnswer() {
      const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
      if (selectedOption) {
        paper[currentQuestion]['Selected'] = selectedOption.value;
  
      }
  
    }
  
    function checkButtonEnable() {
      if (currentQuestion != 0) {
        document.getElementById('previous-btn').disabled = false
      } else {
        document.getElementById('previous-btn').disabled = true
      }
  
      if (currentQuestion === paper.length - 1) {
        document.getElementById('next-btn').innerHTML = 'Submit'
  
      }
      document.querySelector('#question-number').innerHTML = "Question "+ (parseInt(currentQuestion)+1)
    }
  }
  
  function submitQuiz(paper) {
    prevPaper = paper
    PrevQuizScore = paper.map(question => question.Selected === question.Answer)
      .filter(isCorrect => isCorrect)
      .length;
  
    document.querySelector('.quiz-container').innerHTML = `
      <h2 class='score'>Score : ${PrevQuizScore}/${paper.length}</h2>
      <div id='submit-btns'>
        <button id='retake'>Retake Quiz</button>
        <button id='check-ans'>Check Answers</button>
        <button id='another-quiz'>Next Quiz</button>
      </div>
      `
  
      document.querySelector('#retake').addEventListener('click', () => {
        createQuiz(paper)
      })
      document.querySelector('#another-quiz').addEventListener('click', () => {
        createQuiz()
      })
      document.querySelector('#check-ans').addEventListener('click', () => {
      const container = document.querySelector(".quiz-container");
      container.innerHTML = '';
  
      let checkAnswerContainer = document.createElement('div');
      checkAnswerContainer.classList.add('quiz-box');
  
      paper.forEach((question, index) => {
        let options = splitOptions(question['Options']);
        let userSelected = question['Selected'];
        let correctAnswer = question['Answer'];
  
  
        let ansBox = `<div class="question-container"> <p class='check'>Question ${index + 1}. ${question['Question']} </p>`;
  
        options.forEach((option, optIndex) => {
          let optionNumber = optIndex + 1;
          let isCorrect = optionNumber === Number(correctAnswer);
          let isSelected = optionNumber === Number(userSelected);
          let optionStyle = '';
          if (isCorrect) {
            optionStyle = 'color: green;';
          } else if (isSelected) {
            optionStyle = 'color: red;';
          }
  
          ansBox += `
                  <p style="${optionStyle}">
                      ${optionNumber}. ${option}
                  </p>
              `;
        });
        if (userSelected == '-1') {
          ansBox += "<p class='feedback'>You skipped this question.🚫</p>"
        } else if (userSelected == correctAnswer) {
          ansBox += "<p class='feedback'>You Got it right.🎉</p>"
        } else {
          ansBox += "<p class='feedback'>You Got it wrong.❌</p>"
        }
        ansBox += `
          </div>
          `
        checkAnswerContainer.innerHTML += ansBox
      });
  
      container.append(checkAnswerContainer);
      container.innerHTML += `
      <div id='submit-btns'>
        <button id='retake'>Retake Quiz</button>
        <button id='another-quiz'>Next Quiz</button>
      </div>
      `
      document.querySelector('#retake').addEventListener('click', () => {
        createQuiz(paper)
      })
      document.querySelector('#another-quiz').addEventListener('click', () => {
        createQuiz()
      })
    });
  }
  
  function splitOptions(options){
    const regex = /{([^{}]*)}/g;
    let matches = [];
    let match;
    while ((match = regex.exec(options)) !== null) {
      matches.push(match[1].trim()); 
    }
  
    return matches;
  }
  
  function displayQuestion(question) {
    const questionElement = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
  
    questionElement.innerHTML = question['Question']
    let options = question['Options'];
    options = splitOptions(options)
    optionsContainer.innerHTML = '';
    options.forEach((option, index) => {
      const optionLabel = document.createElement('label');
      optionLabel.setAttribute('for', `option${index + 1}`);
      optionLabel.innerHTML += `
           <input type="radio" name="quiz-option" class="option" id="option${index + 1}" value="${index + 1}" ${question["Selected"] == (index + 1).toString() ? "checked" : ""}/> ${option}
        `
      optionsContainer.appendChild(optionLabel);
    });
  
  }
  