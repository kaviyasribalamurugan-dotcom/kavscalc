let expression = "";

let result = "0";

let lastCalculatedExpression = "";

// DISPLAY ELEMENTS

const expressionDisplay = document.getElementById("expression");

const resultDisplay = document.getElementById("result");

const historyList = document.getElementById("historyList");

// ================================
// UPDATE DISPLAY
// ================================

function updateDisplay() {
  expressionDisplay.textContent = expression || "0";

  resultDisplay.textContent = result;
}

// ================================
// FORMAT RESULT
// ================================

function formatNumber(number) {
  if (!Number.isFinite(number)) {
    return null;
  }

  return Number(number.toFixed(10)).toString();
}

// ================================
// BASIC EXPRESSION CALCULATOR
// ================================

function calculateExpression(input) {
  if (!input) {
    return null;
  }

  /*
        If the user is still typing an operator,
        don't show an error.
    */

  if (/[+\-*/.(]$/.test(input)) {
    return null;
  }

  try {
    let math = input.replace(/×/g, "*").replace(/÷/g, "/");

    /*
            Allow only calculator characters.
        */

    if (!/^[0-9+\-*/().\s]+$/.test(math)) {
      return null;
    }

    let answer = Function(`"use strict"; return (${math})`)();

    return formatNumber(answer);
  } catch {
    return null;
  }
}

// ================================
// LIVE CALCULATION
// ================================

function liveCalculate() {
  if (!expression) {
    result = "0";

    return;
  }

  let answer = calculateExpression(expression);

  if (answer !== null) {
    result = answer;
  }
}

// ================================
// ADD VALUE
// ================================

function addValue(value) {
  /*
        If an answer was already calculated
        and user enters a number, start new
        calculation.
    */

  if (
    result !== "0" &&
    lastCalculatedExpression === expression &&
    /^[0-9.]$/.test(value)
  ) {
    expression = value;
  } else {
    /*
            Prevent multiple decimal points
            in the same number.
        */

    if (value === ".") {
      let parts = expression.split(/[+\-*/()]/);

      let currentNumber = parts[parts.length - 1];

      if (currentNumber.includes(".")) {
        return;
      }
    }

    expression += value;
  }

  /*
        LIVE ANSWER
    */

  liveCalculate();

  updateDisplay();
}

// ================================
// CLEAR
// ================================

function clearCalculator() {
  expression = "";

  result = "0";

  lastCalculatedExpression = "";

  updateDisplay();
}

// ================================
// DELETE
// ================================

function deleteLast() {
  if (!expression) {
    return;
  }

  expression = expression.slice(0, -1);

  liveCalculate();

  updateDisplay();
}

// ================================
// SCIENTIFIC FUNCTIONS
// ================================

function scientific(type) {
  let number;

  /*
        If expression exists,
        calculate it first.
    */

  let currentAnswer = calculateExpression(expression);

  if (currentAnswer !== null) {
    number = parseFloat(currentAnswer);
  } else {
    number = parseFloat(result);
  }

  if (isNaN(number)) {
    result = "Error";

    updateDisplay();

    return;
  }

  let answer;

  switch (type) {
    case "sin":
      answer = Math.sin((number * Math.PI) / 180);

      break;

    case "cos":
      answer = Math.cos((number * Math.PI) / 180);

      break;

    case "tan":
      answer = Math.tan((number * Math.PI) / 180);

      break;

    case "sqrt":
      if (number < 0) {
        result = "Error";

        updateDisplay();

        return;
      }

      answer = Math.sqrt(number);

      break;

    case "log":
      if (number <= 0) {
        result = "Error";

        updateDisplay();

        return;
      }

      answer = Math.log10(number);

      break;

    case "ln":
      if (number <= 0) {
        result = "Error";

        updateDisplay();

        return;
      }

      answer = Math.log(number);

      break;

    case "square":
      answer = number * number;

      break;

    case "percent":
      answer = number / 100;

      break;
  }

  let formatted = formatNumber(answer);

  if (formatted === null) {
    result = "Error";
  } else {
    result = formatted;
  }

  /*
        Keep the original expression visible
        and show the scientific result.
    */

  updateDisplay();
}

// ================================
// EQUAL BUTTON
// ================================

function finalCalculate() {
  let answer = calculateExpression(expression);

  if (answer === null) {
    return;
  }

  /*
        Add to history
    */

  addHistory(expression, answer);

  result = answer;

  lastCalculatedExpression = expression;

  updateDisplay();
}

// ================================
// HISTORY
// ================================

function addHistory(calculation, answer) {
  if (!calculation) {
    return;
  }

  if (historyList.querySelector(".empty-history")) {
    historyList.innerHTML = "";
  }

  const item = document.createElement("div");

  item.className = "history-item";

  item.textContent = `${calculation} = ${answer}`;

  historyList.prepend(item);
}

// ================================
// CLEAR HISTORY
// ================================

document.getElementById("clearHistory").addEventListener("click", () => {
  historyList.innerHTML = `
                <p class="empty-history">
                    No calculations yet
                </p>
            `;
});

// ================================
// BUTTON EVENTS
// ================================

document.querySelectorAll(".buttons button").forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;

    const action = button.dataset.action;

    if (value !== undefined) {
      addValue(value);

      return;
    }

    if (action === "clear") {
      clearCalculator();

      return;
    }

    if (action === "delete") {
      deleteLast();

      return;
    }

    if (action) {
      scientific(action);

      return;
    }
  });
});

// ================================
// EQUAL BUTTON
// ================================

document.getElementById("equals").addEventListener("click", finalCalculate);

// ================================
// DARK / LIGHT MODE
// ================================

document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const button = document.getElementById("themeBtn");

  if (document.body.classList.contains("dark")) {
    button.textContent = "☀️";
  } else {
    button.textContent = "🌙";
  }
});

// ================================
// KEYBOARD SUPPORT
// ================================

document.addEventListener("keydown", (event) => {
  const key = event.key;

  /*
            Numbers
        */

  if (/^[0-9]$/.test(key)) {
    addValue(key);

    return;
  }

  /*
            Operators
        */

  if (["+", "-", "*", "/", "(", ")"].includes(key)) {
    addValue(key);

    return;
  }

  /*
            Decimal
        */

  if (key === ".") {
    addValue(".");

    return;
  }

  /*
            Enter = Equal
        */

  if (key === "Enter" || key === "=") {
    finalCalculate();

    return;
  }

  /*
            Backspace
        */

  if (key === "Backspace") {
    deleteLast();

    return;
  }

  /*
            Escape = Clear
        */

  if (key === "Escape") {
    clearCalculator();

    return;
  }
});

// Initial display

updateDisplay();
