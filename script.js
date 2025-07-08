const quotes = [
  "EssentialTECH Malaysia is a community of employees passionate in upskilling their own careers as well as equipping our local community with STEM-based skills to succeed in this evolving world."
];

const maxTries = 2;

let startTime, interval, currentQuote;
let currentPlayer = "";
let bestTime = null;
let tries = 0;

const quoteEl = document.getElementById("quote-output");
const inputEl = document.getElementById("input");
const timerEl = document.getElementById("timer");
const countdownEl = document.getElementById("countdown");
const resultEl = document.getElementById("result");
const submitBtn = document.getElementById("submit-btn");
const playerNameInput = document.getElementById("player-name");
const leaderboardList = document.getElementById("leaderboard-list");

// Utility: get tries from localStorage for a player
function getTries(name) {
  const stored = JSON.parse(localStorage.getItem("tries")) || {};
  return stored[name] || 0;
}

// Utility: save tries count for a player
function setTries(name, count) {
  const stored = JSON.parse(localStorage.getItem("tries")) || {};
  stored[name] = count;
  localStorage.setItem("tries", JSON.stringify(stored));
}

// Load tries when player name changes
playerNameInput.addEventListener("change", () => {
  const name = playerNameInput.value.trim();
  if (name) {
    tries = getTries(name);
    bestTime = null;
    updateResultTriesLeft();
  } else {
    tries = 0;
    bestTime = null;
  }
});

// Initial load
function preloadQuote() {
  currentQuote = quotes[0];
  renderQuote(currentQuote);
  updateLeaderboard();
}

function renderQuote(quote) {
  quoteEl.innerHTML = "";
  quote.split("").forEach(char => {
    const span = document.createElement("span");
    span.textContent = char;
    quoteEl.appendChild(span);
  });
}

function startCountdown() {
  const name = playerNameInput.value.trim();
  if (!name) {
    alert("Please enter your name before starting!");
    playerNameInput.focus();
    return;
  }
  if (tries >= maxTries) {
    alert("You have used all your 2 tries.");
    return;
  }

  currentPlayer = name;

  inputEl.disabled = true;
  inputEl.value = "";
  submitBtn.disabled = true;
  resultEl.style.display = "none";
  timerEl.textContent = "0";
  countdownEl.textContent = "3";

  let count = 3;
  const countdown = setInterval(() => {
    count--;
    countdownEl.textContent = count > 0 ? count.toString() : "Go!";
    if (count <= 0) {
      clearInterval(countdown);
      countdownEl.textContent = "";
      startGame();
    }
  }, 1000);
}

function startGame() {
  currentQuote = quotes[0];
  renderQuote(currentQuote);

  inputEl.disabled = false;
  inputEl.placeholder = "Start typing...";
  inputEl.focus();
  startTime = Date.now();
  submitBtn.disabled = true;
  clearInterval(interval);
  interval = setInterval(updateTimer, 100);
}

function updateTimer() {
  const elapsed = (Date.now() - startTime) / 1000;
  timerEl.textContent = elapsed.toFixed(1);
}

function updateTypingFeedback() {
  const typed = inputEl.value;
  const quoteSpans = quoteEl.querySelectorAll("span");
  let allCorrect = true;

  for (let i = 0; i < quoteSpans.length; i++) {
    const char = typed[i];
    if (!char) {
      quoteSpans[i].className = "";
      allCorrect = false;
    } else if (char === quoteSpans[i].textContent) {
      quoteSpans[i].className = "correct";
    } else {
      quoteSpans[i].className = "incorrect";
      allCorrect = false;
    }
  }

  submitBtn.disabled = !(allCorrect && typed.length === currentQuote.length);
}

function endGame() {
  clearInterval(interval);
  inputEl.disabled = true;
  submitBtn.disabled = true;

  const finalTime = (Date.now() - startTime) / 1000;

  tries++;
  setTries(currentPlayer, tries);

  if (bestTime === null || finalTime < bestTime) {
    bestTime = finalTime;
    saveScore(currentPlayer, bestTime);
  }

  resultEl.innerHTML = `
    <h2>🎉 Finished!</h2>
    <p>⏱ Your final time: ${finalTime.toFixed(2)} seconds</p>
    <p>You have ${maxTries - tries} tries left.</p>
  `;
  resultEl.style.display = "block";

  updateLeaderboard();
}

function saveScore(name, time) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  const index = leaderboard.findIndex(entry => entry.name === name);
  if (index > -1) {
    if (time < leaderboard[index].time) {
      leaderboard[index].time = time;
    }
  } else {
    leaderboard.push({ name, time });
  }

  leaderboard.sort((a, b) => a.time - b.time);
  leaderboard = leaderboard.slice(0, 3);

  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function updateLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboardList.innerHTML = "";

  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = "<li>No scores yet.</li>";
    return;
  }

  leaderboard.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.name} — ${entry.time.toFixed(2)} sec`;
    leaderboardList.appendChild(li);
  });
}

function updateResultTriesLeft() {
  if (resultEl.style.display === "block") {
    resultEl.innerHTML += `<p>You have ${maxTries - tries} tries left.</p>`;
  }
}

// Event listeners
inputEl.addEventListener("input", () => {
  updateTimer();
  updateTypingFeedback();
});

submitBtn.addEventListener("click", endGame);

inputEl.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !submitBtn.disabled) {
    e.preventDefault();
    endGame();
  }
});

// Reset leaderboard button handler
document.getElementById("reset-leaderboard-btn").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear the leaderboard?")) {
    localStorage.removeItem("leaderboard");
    updateLeaderboard();
  }
});

preloadQuote();
