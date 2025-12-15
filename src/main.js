import {
  Difficulty,
  getState,
  resetAll,
  goToScreen,
  setDifficulty,
  getCurrentQuestion,
  nextQuestion,
  startTimer,
  pauseTimer,
} from "./gameState.js";

const app = document.getElementById("app");
const overlayRoot = document.getElementById("overlay-root");

let swipeStartX = null;

function render() {
  const state = getState();
  app.innerHTML = "";

  const shell = document.createElement("div");
  shell.className = "app-shell";

  if (state.screen === "splash") {
    shell.appendChild(renderSplash());
  } else if (state.screen === "difficultySelect") {
    shell.appendChild(renderDifficultySelect());
  } else if (state.screen === "game") {
    shell.appendChild(renderGame());
  }

  app.appendChild(shell);
}

function renderSplash() {
  const card = document.createElement("div");
  card.className = "card splash-card splash";
  card.addEventListener("click", () => {
    goToScreen("difficultySelect");
    render();
  });

  const inner = document.createElement("div");
  inner.style.width = "100%";

  // Ícone decorativo no topo
  const iconTop = document.createElement("div");
  iconTop.className = "splash-icon-top";
  iconTop.innerHTML = "🎯";

  const title = document.createElement("div");
  title.className = "splash-title";
  title.innerHTML =
    '<span class="splash-family">Família</span> <span class="splash-highlight">Gomes</span>';

  const subtitle = document.createElement("div");
  subtitle.className = "splash-subtitle";
  subtitle.textContent = "Quiz de Conhecimentos";

  const text = document.createElement("div");
  text.className = "splash-text";
  text.textContent =
    "Teste seus conhecimentos com perguntas de diferentes níveis de dificuldade!";

  // Decorações laterais
  const decorLeft = document.createElement("div");
  decorLeft.className = "splash-decor decor-left";
  decorLeft.innerHTML = "✨";

  const decorRight = document.createElement("div");
  decorRight.className = "splash-decor decor-right";
  decorRight.innerHTML = "⭐";

  const tap = document.createElement("div");
  tap.className = "splash-tap";
  tap.innerHTML = '<span class="tap-icon">👆</span> Toque para começar';

  const pulse = document.createElement("div");
  pulse.className = "splash-pulse";
  const innerPulse = document.createElement("div");
  innerPulse.className = "splash-pulse-inner";
  innerPulse.innerHTML = "🎮";
  pulse.appendChild(innerPulse);

  inner.appendChild(iconTop);
  inner.appendChild(decorLeft);
  inner.appendChild(decorRight);
  inner.appendChild(title);
  inner.appendChild(subtitle);
  inner.appendChild(text);
  inner.appendChild(tap);
  inner.appendChild(pulse);
  card.appendChild(inner);
  return card;
}

function renderDifficultySelect() {
  const card = document.createElement("div");
  card.className = "card";

  const header = document.createElement("div");
  header.className = "card-header";
  header.innerHTML = `
    <div>
      <div class="title">Selecione o nível</div>
      <div class="subtitle">Escolha a dificuldade das perguntas</div>
    </div>
  `;

  const body = document.createElement("div");
  body.className = "stack mt-16";

  const btnFacil = document.createElement("button");
  btnFacil.className = "primary-btn full-width";
  btnFacil.textContent = "Fácil";
  btnFacil.onclick = () => {
    setDifficulty(Difficulty.FACIL);
    goToScreen("game");
    render();
  };

  const btnMedio = document.createElement("button");
  btnMedio.className = "secondary-btn full-width";
  btnMedio.textContent = "Médio";
  btnMedio.onclick = () => {
    setDifficulty(Difficulty.MEDIO);
    goToScreen("game");
    render();
  };

  const btnDificil = document.createElement("button");
  btnDificil.className = "secondary-btn full-width";
  btnDificil.textContent = "Difícil";
  btnDificil.onclick = () => {
    setDifficulty(Difficulty.DIFICIL);
    goToScreen("game");
    render();
  };

  const backBtn = document.createElement("button");
  backBtn.className = "ghost-btn full-width";
  backBtn.textContent = "Voltar";
  backBtn.onclick = () => {
    goToScreen("splash");
    render();
  };

  body.appendChild(btnFacil);
  body.appendChild(btnMedio);
  body.appendChild(btnDificil);
  body.appendChild(backBtn);

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

function renderGame() {
  const state = getState();
  const current = getCurrentQuestion();
  const card = document.createElement("div");
  card.className = "card";

  const header = document.createElement("div");
  header.className = "game-header";

  const left = document.createElement("div");
  left.innerHTML = `
    <div class="pill pill-soft">Nível: ${
      state.difficulty === Difficulty.FACIL
        ? "Fácil"
        : state.difficulty === Difficulty.MEDIO
        ? "Médio"
        : "Difícil"
    }</div>
    <div class="text-xs text-muted mt-8">Pergunta ${state.currentQuestionIndex + 1} de ${state.questions.length}</div>
  `;

  const timer = document.createElement("div");
  timer.id = "game-timer";
  timer.className = "timer";
  if (state.timeLeft <= 5) timer.classList.add("danger");
  else if (state.timeLeft <= 10) timer.classList.add("urgent");
  timer.textContent = `${state.timeLeft}s`;

  header.appendChild(left);
  header.appendChild(timer);

  const body = document.createElement("div");

  const questionBox = document.createElement("div");
  questionBox.className = "question-box";
  questionBox.innerHTML = `
    <div class="question-label">Pergunta</div>
    <div class="question-text">${current.q}</div>
    <div class="answer-label">Resposta</div>
    <div class="answer-text">${current.a || "—"}</div>
  `;

  const actionsRow = document.createElement("div");
  actionsRow.className = "row space-between mt-12";

  const skipBtn = document.createElement("button");
  skipBtn.className = "ghost-btn";
  skipBtn.textContent = "Pular Pergunta";
  skipBtn.onclick = () => {
    pauseTimer();
    nextQuestion();
    setTimeout(() => {
      render();
    }, 100);
  };

  const restartBtn = document.createElement("button");
  restartBtn.className = "ghost-btn";
  restartBtn.textContent = "Novo Jogo";
  restartBtn.onclick = () => {
    pauseTimer();
    resetAll();
    render();
  };

  actionsRow.appendChild(skipBtn);
  actionsRow.appendChild(restartBtn);

  body.appendChild(questionBox);
  body.appendChild(actionsRow);

  card.appendChild(header);
  card.appendChild(body);

  // reinicia timer se não estiver rodando
  if (state.isPaused && state.timeLeft === 30) {
    startTimer(
      () => {
        updateTimerDisplay();
      },
      () => {
        handleTimeout();
      }
    );
  }

  return card;
}

function updateTimerDisplay() {
  const state = getState();
  const timerEl = document.getElementById("game-timer");
  if (!timerEl) return;

  timerEl.textContent = `${state.timeLeft}s`;
  timerEl.classList.remove("urgent", "danger");

  if (state.timeLeft <= 5) {
    timerEl.classList.add("danger");
  } else if (state.timeLeft <= 10) {
    timerEl.classList.add("urgent");
  }
}

function handleTimeout() {
  pauseTimer();
  // Quando o tempo acaba, apenas vai para a próxima pergunta
  nextQuestion();
  render();
}

// Inicialização
render();
