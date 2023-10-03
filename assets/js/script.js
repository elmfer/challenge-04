// Maximum numbers of scores stored in the scoreboard.
const MAX_NUM_SCORES = 20;

// The quiz context object handles all logic for the quizzing game.
const quizContext = {
  questionNumber: 0,
  currentScore: 0,
  currentQuestion: questions[0],
  timeLeftSeconds: 0,
  timerInterval: null,
  previousMillis: 0,
  ignoreAnswers: false,
  questionTime: 0,
  // Initializes a new quizzing game session.
  startQuiz: function() {
    this.questionNumber = 1;
    this.currentScore = 0;
    this.timeLeftSeconds = 30;

    randomizeQuestions();
    this.currentQuestion = questions[0];
    this.questionTime = Date.now();

    // Display the first question
    quizScreen.renderQuestion(this.currentQuestion);
    quizScreen.renderScore(this.currentScore);

    this.startTimer();
    setScreen('quiz');
  },
  // Handles for when player chooses the correct choice.
  answeredRight: function() {
    // Ignore if player has already answered the question but the
    // next question hasn't appeared yet. Avoids duplicate responses
    // on same question.
    if(this.ignoreAnswers) return;
    this.ignoreAnswers = true;

    // Caclulate score earned on the question. The faster answered, the more points earned.
    const secondsElapsedOnQuestion = (Date.now() - this.questionTime) / 1000;
    this.currentScore += 20 / (0.45 * secondsElapsedOnQuestion + 1);
    
    // Render the result and new score
    quizScreen.renderScore(Math.floor(this.currentScore));
    quizScreen.renderResult(true);

    // In 0.5s, go to the next question
    setTimeout(() => { this.ignoreAnswers = false; quizContext.nextQuestion(); }, 500);
  },
  // Handles for when the player chooses the wrong choice.
  answeredWrong: function() {
    // Ignore if player has already answered the question but the
    // next question hasn't appeared yet. Avoids duplicate responses
    // on same question.
    if(this.ignoreAnswers) return;
    this.ignoreAnswers = true;

    // Deduct 10s and render the result
    quizScreen.renderResult(false);
    this.timeLeftSeconds -= 10;

    // In 0.5s, go to the next question
    setTimeout(() => { this.ignoreAnswers = false; quizContext.nextQuestion(); }, 500);
  },
  // Ends the quizzing game. Executed when player answered all questions or
  // time has run out.
  endQuiz: function() {
    doneScreen.renderScore(Math.floor(this.currentScore));
    setScreen('done');
    clearInterval(quizContext.timerInterval);
  },
  // Fetch and display the next question
  nextQuestion: function() {
    // Ignore request if the timer is up
    if(this.timeLeftSeconds <= 0) return;

    // If player answered all questions, end the quiz.
    if(this.questionNumber == questions.length) {
      doneScreen.renderMessage("All Done!");
      this.endQuiz();
      return;
    } 

    // Increment to next question and capture the current time.
    this.questionNumber++;
    this.questionTime = Date.now();

    // Fetch the next question
    this.currentQuestion = questions[this.questionNumber - 1];
    quizScreen.renderQuestion(this.currentQuestion);
  },
  // Start the timer that updates the timer display and handles for when
  // time has run out
  startTimer: function() {
    // If timer already exists, clear it
    if(this.timerInterval) clearInterval(this.timerInterval);

    this.previousMillis = Date.now();
    this.timerInterval = setInterval(function() {
      // Subtract time elapsed from time left
      const millisNow = Date.now();
      const millisElapsed = millisNow - quizContext.previousMillis;
      quizContext.timeLeftSeconds -= millisElapsed / 1000;

      // If player has ran out of time, end the quiz
      if(quizContext.timeLeftSeconds < 0) {
        doneScreen.renderMessage("Time's Up!");
        quizContext.endQuiz();
        quizScreen.renderTimeLeft(0);
        return;
      }

      // Render the amount of time left
      quizScreen.renderTimeLeft(quizContext.timeLeftSeconds);
      quizContext.previousMillis = millisNow;
    }, 100);
  }
};

// The scoreboard manager object manages the scoreboard
const scoreboardManager = {
  getScores: function() {
    // Fetch scores from local storage
    var scoreboardList = localStorage.getItem('scoreboard');

    // Return empty array if local storage doesn't have
    // scores yet.
    if(!scoreboardList) return [];

    return JSON.parse(scoreboardList);
  },
  clearScores: function() {
    // Clear score in local storage
    localStorage.setItem('scoreboard', '[]');
  },
  addScore: function(name, score) {
    var scoreboardList = this.getScores();

    // Sort list from greatest to least score
    scoreboardList.push({name: name, score: score});
    scoreboardList.sort((a, b) => b.score - a.score);

    // Remove duplicate scores from the same player
    scoreboardList = scoreboardList.filter((entry, index, arr) => {
      var nextEntry = arr[index + 1];

      if(!nextEntry) return true;

      var key = `${entry.name}-${entry.score}`;
      var nextKey = `${nextEntry.name}-${nextEntry.score}`;

      if(key === nextKey) return false;

      return true;
    });

    // If list exceeds max number of scores, truncate it to maximum
    if(scoreboardList.length > MAX_NUM_SCORES) scoreboardList.length = MAX_NUM_SCORES;

    // Save it in local storage.
    localStorage.setItem('scoreboard', JSON.stringify(scoreboardList));
  }
};

// Welcome screen managing the welcome screen on the DOM
const welcomeScreen = {
  element: document.getElementById('welcome-screen'),
  startBtn: document.getElementById('start'),
  // Initialzie button behaviors
  init: function() {
    // Start quiz if player clicks on start.
    this.startBtn.onclick = () => quizContext.startQuiz();
  }
};

// Quiz screen managing the quiz screen on the DOM
const quizScreen = {
  element: document.getElementById('quiz-screen'),
  questionNumberElm: document.getElementById('question-number'),
  resultElm: document.getElementById('result'),
  timeLeftElm: document.getElementById('time-left'),
  scoreElm: document.getElementById('score'),
  questionElm: document.getElementById('question'),
  choicesElm: document.getElementById('choices'),

  // Render the question and its choices.
  renderQuestion: function(question) {
    // Render the question and question number
    this.questionNumberElm.textContent = quizContext.questionNumber;
    this.questionElm.textContent = quizContext.currentQuestion.question;

    // Clear the choices
    this.choicesElm.innerHTML = '';

    // Loop through all choices of the question
    for(var i = 0; i < question.choices.length; i++) {
      // Create a button for the respective choice 
      var choiceBtn = document.createElement('button');
      choiceBtn.id = 'choice-' + i;
      choiceBtn.textContent = question.choices[i];

      if(question.answer === i) {
        // Handle click if this choice is correct
        choiceBtn.onclick = function(event) {
          var button = event.target;
          button.style.color = 'lightgreen';
          button.style.paddingLeft = '10px';
          quizContext.answeredRight();
        };
      } else {
        // Handle click if this choice is wrong
        choiceBtn.onclick = function(event) {
          var button = event.target;
          button.style.color = 'palevioletred';
          button.style.paddingLeft = '10px';
          quizContext.answeredWrong();
        }
      }

      // Add choice button to list of choices.
      this.choicesElm.appendChild(choiceBtn);
    }
  },

  // Renders the timer in 0:00 format
  renderTimeLeft: function(timeLeftSeconds) {
    const minutes = Math.floor(timeLeftSeconds / 60);
    const seconds = Math.floor(timeLeftSeconds % 60);

    this.timeLeftElm.textContent = minutes + ':' + String(seconds).padStart(2, '0');
  },

  // Renders the current score
  renderScore: function(score) {
    this.scoreElm.textContent = score;
  },

  // Renders the result that indicates if player answered correctly or not.
  renderResult: function(isCorrect) {
    this.resultElm.style.transition = '0s';
    this.resultElm.style.color = isCorrect ? 'lightgreen' : 'palevioletred';
    this.resultElm.style.opacity = '100%';
    this.resultElm.textContent = isCorrect ? "Correct!" : "Wrong!";

    // Fade it out in 1s
    setTimeout(function() {
      quizScreen.resultElm.style.transition = '2s';
      quizScreen.resultElm.style.opacity = '0%';
    }, 1000);
  }
}

// The done screen managing the done screen in the DOM
const doneScreen = {
  element: document.getElementById('done-screen'),
  finalScoreElm: document.getElementById('final-score'),
  submitBtn: document.getElementById('submit'),
  nameInputBtn: document.getElementById('name-input'),
  messageElm: document.getElementById('done-message'),
  nameWarnElm: document.getElementById('name-warn'),

  // Initialize button behaviors
  init: function() {
    // Handle for when player submits thier name
    this.submitBtn.onclick = function() {
      // Warn user that they need to input something.
      if(doneScreen.nameInputBtn.value === "") {
        doneScreen.nameWarnElm.style.display = 'block';
        return;
      }
      
      // Clear warning if any
      doneScreen.nameWarnElm.style.display = "none";

      // Add score to scoreboard.
      scoreboardManager.addScore(doneScreen.nameInputBtn.value, Math.floor(quizContext.currentScore));
      scoreboardScreen.renderScores(scoreboardManager.getScores());

      // Switch to the scoreboard screen.
      setScreen('scoreboard');
    };
  },

  renderMessage: function(message) {
    this.messageElm.textContent = message;
  },

  renderScore: function(score) {
    this.finalScoreElm.textContent = score;
  }
}

// Scoreboard screen object managing the scoreboard screen in the DOM
const scoreboardScreen = {
  element: document.getElementById('scoreboard-screen'),
  newGameBtn: document.getElementById('new-game'),
  clearScoresBtn: document.getElementById('clear-scores'),
  scoreboardElm: document.getElementById('scoreboard'),

  // Initialize buttons' behaviors
  init: function() {
    // Go to welcome screen if clicked on New Game
    this.newGameBtn.onclick = function() {
      setScreen('welcome');
    };

    // Clear the scores on the scoreboard when clicked
    this.clearScoresBtn.onclick = function() {
      scoreboardManager.clearScores();
      scoreboardScreen.renderScores([]);
    }
  },

  // Display scores on to the DOM
  renderScores: function(scores) {
    // Clear all rows from the table except the first one
    while(this.scoreboardElm.children.length > 1) {
      this.scoreboardElm.children[1].remove();
    }

    // Create a row for each score entry with it's
    // name and score displayed
    for(var i = 0; i < scores.length; i++) {
      var row = document.createElement('tr');
      var nameTd = document.createElement('td');
      var scoreTd = document.createElement('td');
      nameTd.textContent = scores[i].name;
      scoreTd.textContent = scores[i].score;

      row.appendChild(nameTd);
      row.appendChild(scoreTd);

      this.scoreboardElm.appendChild(row);
    }
  }
}

// Toggles between screens
function setScreen(screen) {
  var screens = document.querySelectorAll('.screen');

  // Hide all screens
  for(var i = 0; i < screens.length; i++) {
    screens[i].hidden = true;
  }

  // Show selected screen.
  document.getElementById(screen + '-screen').hidden = false;
}

// Entry point. Initialzize all screens and start on the welcome screen.
function init() {
  welcomeScreen.init();
  doneScreen.init();
  scoreboardScreen.init();
  setScreen('welcome');
}

init();