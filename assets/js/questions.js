// Array of possible questions are stored here

var questions = [
  {
    question: "What type is \'Nan\'?",
    choices: [
      "Number", "String", "BigInt", "undefined"
    ],
    answer: 0 
  },
  {
    question: "Creating a variable equal to \'{}\' with key value pairs inside is called a/an ______.",
    choices: [
      "array", "object", "function", "map"
    ],
    answer: 1
  },
  {
    question: "Centering a div was always hard, not until ______ were introducted in CSS.",
    choices : [
      "float", "selectors", "media queries", "flex boxes"
    ],
    answer: 3
  },
  {
    question: "HTML is a ______.",
    choices: [
      "programming language", "markup language", "browser script", "PDF"
    ],
    answer: 1
  },
  {
    question: "The \'setInterval\' function executes code after a certain duration. True or false?",
    choices: [
      "True", "False"
    ],
    answer: 1
  },
  {
    question: "In CSS exists the \'color\' property. What does it do?",
    choices: [
      "Changes the background color", "Changes the border color", "Changes the text color",
      "Nothing"
    ],
    answer: 2
  },
  {
    question: "You want to hide an element. How do you acomplish that?",
    choices: [
      "Set it's display property to \'none\'",
      "Apply the \'hidden\' attribute",
      "Both of the above",
      "Delete the element from the DOM"
    ],
    answer: 2,
    randomizeChoices: false
  },
  {
    question: "What selector do you use to grab an element with an id of \'message\'?",
    choices: [
      "#message", ".message", "message", "document.getElementById('message')"
    ],
    answer: 0
  },
  {
    question: "In Javascript, everything is treated as a/an ______.",
    choices: [
      "object", "array", "primitives", "classes"
    ],
    answer: 0
  },
  {
    question: "In CSS, a selector that grabs an element by it's state, attribute, or position such as \':hover\' is called _____.",
    choices: [
      "IDs", "classes", "psuedo classes", "property"
    ],
    answer: 2
  },
  {
    question: "In HTML, how do you add data attributes to an element? (<data-attr> is a data name placeholder)",
    choices: [
      "<data-attr>=\"\"", "data-<data-attr>=\"\"", "dataset-<data-attr>=\"\"", "data<data-attr>=\"\""
    ],
    answer: 1
  }
]

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function randomizeChoices(question) {
  var tempChoices = [...question.choices];
  var answer = question.choices[question.answer];

  question.choices.length = 0;

  while(tempChoices.length > 0) {
    const randIndex = randInt(tempChoices.length);

    question.choices.push(tempChoices[randIndex]);

    tempChoices.splice(randIndex, 1);
  }

  question.answer = question.choices.indexOf(answer);
}

function randomizeQuestions() {
  var tempQuestions = [...questions];

  questions.length = 0;

  while(tempQuestions.length > 0) {
    const randIndex = randInt(tempQuestions.length);
    var question = tempQuestions[randIndex];

    if(question.randomizeChoices === undefined || question.randomizeChoices)
      randomizeChoices(question);

    questions.push(question);

    tempQuestions.splice(randIndex, 1);
  }
}