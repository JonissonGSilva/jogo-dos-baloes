import { QUESTIONS } from "./questions.js";

export const Difficulty = Object.freeze({
  FACIL: "facil",
  MEDIO: "medio",
  DIFICIL: "dificil",
});

let state = {
  screen: "splash", // splash | difficultySelect | game
  difficulty: null,
  questions: [],
  currentQuestionIndex: 0,
  timeLeft: 30,
  timerId: null,
  isPaused: true,
};

export function getState() {
  return state;
}

export function resetAll() {
  clearTimer();
  state = {
    screen: "splash",
    difficulty: null,
    questions: [],
    currentQuestionIndex: 0,
    timeLeft: 30,
    timerId: null,
    isPaused: true,
  };
}

export function goToScreen(screen) {
  state.screen = screen;
}

export function setDifficulty(diffKey) {
  state.difficulty = diffKey;
  const pool = QUESTIONS[diffKey] || [];
  // Embaralha para partidas diferentes
  state.questions = [...pool].sort(() => Math.random() - 0.5);
  state.currentQuestionIndex = 0;
  state.timeLeft = 30;
}

export function getCurrentQuestion() {
  return (
    state.questions[state.currentQuestionIndex] || {
      q: "Sem perguntas disponíveis.",
      a: "",
    }
  );
}

export function nextQuestion() {
  state.currentQuestionIndex =
    (state.currentQuestionIndex + 1) % Math.max(state.questions.length, 1);
  state.timeLeft = 30;
}

export function startTimer(onTick, onTimeout) {
  clearTimer();
  state.isPaused = false;
  state.timerId = setInterval(() => {
    if (state.timeLeft <= 1) {
      state.timeLeft = 0;
      clearTimer();
      state.isPaused = true;
      onTick?.(state.timeLeft);
      onTimeout?.();
      return;
    }
    state.timeLeft -= 1;
    onTick?.(state.timeLeft);
  }, 1000);
}

export function pauseTimer() {
  clearTimer();
  state.isPaused = true;
}

function clearTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}
