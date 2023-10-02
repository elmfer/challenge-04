const MAX_NUM_SCORES = 20;

const quizContext = {
  questionNumber: 0,
  currentScore: 0,
  currentQuestion: questions[0],
  timeLeftSeconds: 0,
  timerInterval: null,
  previousMillis: 0,
  ignoreAnswers: false,
  startQuiz: function() {
    this.questionNumber = 1;
    this.currentScore = 0;
    this.timeLeftSeconds = 30;
    this.currentQuestion = questions[0];

    quizScreen.renderQuestion(this.currentQuestion);
    quizScreen.renderScore(this.currentScore);
    this.startTimer();
    setScreen('quiz');
  },
  answeredRight: function() {
    if(this.ignoreAnswers) return;
    this.ignoreAnswers = true;

    quizScreen.renderResult(true);
    this.currentScore += 5;
    quizScreen.renderScore(this.currentScore);

    setTimeout(() => { this.ignoreAnswers = false; quizContext.nextQuestion(); }, 500);
  },
  answeredWrong: function() {
    if(this.ignoreAnswers) return;
    this.ignoreAnswers = true;

    quizScreen.renderResult(false);
    this.timeLeftSeconds -= 10;

    setTimeout(() => { this.ignoreAnswers = false; quizContext.nextQuestion(); }, 500);
  },
  endQuiz: function() {
    doneScreen.renderScore(this.currentScore);
    setScreen('done');
    clearInterval(quizContext.timerInterval);
  },
  nextQuestion: function() {
    if(this.timeLeftSeconds <= 0) return;

    if(this.questionNumber == questions.length) {
      doneScreen.renderMessage("All Done!");
      this.endQuiz();
      return;
    } 

    this.questionNumber++;

    this.currentQuestion = questions[this.questionNumber - 1];
    quizScreen.renderQuestion(this.currentQuestion);
  },
  startTimer: function() {
    if(this.timerInterval) clearInterval(this.timerInterval);

    this.previousMillis = Date.now();
    this.timerInterval = setInterval(function() {
      const millisNow = Date.now();
      const millisElapsed = millisNow - quizContext.previousMillis;

      quizContext.timeLeftSeconds -= millisElapsed / 1000;

      if(quizContext.timeLeftSeconds < 0) {
        doneScreen.renderMessage("Time's Up!");
        quizContext.endQuiz();
        quizScreen.renderTimeLeft(0);
        return;
      }

      quizScreen.renderTimeLeft(quizContext.timeLeftSeconds);

      quizContext.previousMillis = millisNow;
    }, 100);
  }
};

const scoreboardManager = {
  getScores: function() {
    var scoreboardList = localStorage.getItem('scoreboard');

    if(!scoreboardList) return [];

    return JSON.parse(scoreboardList);
  },
  clearScores: function() {
    localStorage.setItem('scoreboard', '[]');
  },
  addScore: function(name, score) {
    var scoreboardList = this.getScores();

    scoreboardList.push({name: name, score: score});
    scoreboardList.sort((a, b) => b.score - a.score);
    if(scoreboardList.length > MAX_NUM_SCORES) scoreboardList.length = MAX_NUM_SCORES;

    localStorage.setItem('scoreboard', JSON.stringify(scoreboardList));
  }
};

const welcomeScreen = {
  element: document.getElementById('welcome-screen'),
  startBtn: document.getElementById('start'),
  init: function() {
    this.startBtn.onclick = () => quizContext.startQuiz();
  }
};

const quizScreen = {
  element: document.getElementById('quiz-screen'),
  questionNumberElm: document.getElementById('question-number'),
  resultElm: document.getElementById('result'),
  timeLeftElm: document.getElementById('time-left'),
  scoreElm: document.getElementById('score'),
  questionElm: document.getElementById('question'),
  choicesElm: document.getElementById('choices'),

  renderQuestion: function(question) {
    this.questionNumberElm.textContent = quizContext.questionNumber;
    this.questionElm.textContent = quizContext.currentQuestion.question;

    this.choicesElm.innerHTML = '';
    for(var i = 0; i < question.choices.length; i++) {
      var choiceBtn = document.createElement('button');
      choiceBtn.id = 'choice-' + i;
      choiceBtn.textContent = question.choices[i];
      if(question.answer === i) {
        choiceBtn.onclick = function(event) {
          var button = event.target;
          button.style.color = 'lightgreen';
          button.style.paddingLeft = '10px';
          quizContext.answeredRight();
        };
      } else {
        choiceBtn.onclick = function(event) {
          var button = event.target;
          button.style.color = 'palevioletred';
          button.style.paddingLeft = '10px';
          quizContext.answeredWrong();
        }
      }

      this.choicesElm.appendChild(choiceBtn);
    }
  },

  renderTimeLeft: function(timeLeftSeconds) {
    const minutes = Math.floor(timeLeftSeconds / 60);
    const seconds = Math.floor(timeLeftSeconds % 60);

    this.timeLeftElm.textContent = minutes + ':' + String(seconds).padStart(2, '0');
  },

  renderScore: function(score) {
    this.scoreElm.textContent = score;
  },

  renderResult: function(isCorrect) {
    this.resultElm.style.transition = '0s';
    this.resultElm.style.color = isCorrect ? 'lightgreen' : 'palevioletred';
    this.resultElm.style.opacity = '100%';
    this.resultElm.textContent = isCorrect ? "Correct!" : "Wrong!";

    setTimeout(function() {
      quizScreen.resultElm.style.transition = '2s';
      quizScreen.resultElm.style.opacity = '0%';
    }, 1000);
  }
}

const doneScreen = {
  element: document.getElementById('done-screen'),
  finalScoreElm: document.getElementById('final-score'),
  submitBtn: document.getElementById('submit'),
  nameInputBtn: document.getElementById('name-input'),
  messageElm: document.getElementById('done-message'),
  nameWarnElm: document.getElementById('name-warn'),

  init: function() {
    this.submitBtn.onclick = function() {
      if(doneScreen.nameInputBtn.value === "") {
        doneScreen.nameWarnElm.style.display = 'block';
        return;
      }
      
      doneScreen.nameWarnElm.style.display = "none";
      scoreboardManager.addScore(doneScreen.nameInputBtn.value, quizContext.currentScore);
      scoreboardScreen.renderScores(scoreboardManager.getScores());
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

const scoreboardScreen = {
  element: document.getElementById('scoreboard-screen'),
  newGameBtn: document.getElementById('new-game'),
  clearScoresBtn: document.getElementById('clear-scores'),
  scoreboardElm: document.getElementById('scoreboard'),

  init: function() {
    this.newGameBtn.onclick = function() {
      setScreen('welcome');
    };
    this.clearScoresBtn.onclick = function() {
      scoreboardManager.clearScores();
      scoreboardScreen.renderScores([]);
    }
  },

  renderScores: function(scores) {
    while(this.scoreboardElm.children.length > 1) {
      this.scoreboardElm.children[1].remove();
    }

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

function setScreen(screen) {
  var screens = document.querySelectorAll('.screen');

  for(var i = 0; i < screens.length; i++) {
    screens[i].hidden = true;
  }

  document.getElementById(screen + '-screen').hidden = false;
}

function init() {
  welcomeScreen.init();
  doneScreen.init();
  scoreboardScreen.init();
  setScreen('welcome');
}

init();