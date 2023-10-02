const quizContext = {
  questionNumber: 0,
  currentScore: 0,
  currentQuestion: questions[0],
  timeLeftSeconds: 0,
  timerInterval: null,
  previousMillis: 0,
  startQuiz: function() {
    this.questionNumber = 1;
    this.currentScore = 0;
    this.timeLeftSeconds = 30;

    quizScreen.renderQuestion(this.currentQuestion);
    quizScreen.renderScore(this.currentScore);
    this.startTimer();
    setScreen('quiz');
  },
  answeredRight: function() {
    quizScreen.renderResult(true);
    this.currentScore += 5;
    quizScreen.renderScore(this.currentScore);

    setTimeout(() => { quizContext.nextQuestion(); }, 500);
  },
  answeredWrong: function() {
    quizScreen.renderResult(false);
    this.timeLeftSeconds -= 5;

    setTimeout(() => { quizContext.nextQuestion(); }, 500);
  },
  endQuiz: function() {
    setScreen('done');
  },
  nextQuestion: function() {
    if(this.questionNumber == questions.length) {
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
        quizContext.endQuiz();
        clearInterval(quizContext.timerInterval);
        quizScreen.renderTimeLeft(0);
        return;
      }

      quizScreen.renderTimeLeft(quizContext.timeLeftSeconds);

      quizContext.previousMillis = millisNow;
    }, 100);
  }
}

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
  nameInputBtn: document.getElementById('name-input')
}

const scoreboardScreen = {
  element: document.getElementById('scoreboard-screen'),
  newGameBtn: document.getElementById('new-game'),
  clearScoresBtn: document.getElementById('clear-scores'),
  scoreboardElm: document.getElementById('scoreboard')
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
  setScreen('welcome');
}

init();