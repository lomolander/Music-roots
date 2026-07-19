import questions from "../data/questions.js";

export const QUESTIONS_PER_GAME = 10;

export const QUIZ_MODES = {
  title: { label: "Indovina il titolo", prompt: "Qual è il titolo del brano?" },
  artist: { label: "Indovina l'artista", prompt: "Chi interpreta questo brano?" },
  year: { label: "Indovina l'anno", prompt: "In quale anno è stato pubblicato?" },
  genre: { label: "Indovina il genere", prompt: "A quale genere appartiene il brano?" },
  subgenre: { label: "Indovina il sottogenere", prompt: "Qual è il sottogenere del brano?" },
};

export const DIFFICULTIES = {
  easy: { label: "Facile", answers: 3, points: 5 },
  normal: { label: "Normale", answers: 4, points: 10 },
  hard: { label: "Difficile", answers: 4, points: 15 },
};

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

export function hasValidHttpsPreview(preview) {
  if (typeof preview !== "string" || preview.trim() === "") return false;
  try { return new URL(preview).protocol === "https:"; } catch { return false; }
}

export function getPlayableQuestions(source = questions) {
  return source.filter((question) => question.previewSource === "apple" && question.appleMatchStatus === "verified" && question.previewValidated === true && hasValidHttpsPreview(question.preview));
}

export function answerFor(question, mode) {
  if (mode === "artist") return question.artist;
  if (mode === "year") return String(question.year);
  if (mode === "genre") return question.genre;
  if (mode === "subgenre") return question.subgenre;
  return question.title;
}

function candidateScore(question, candidate, difficulty) {
  const similarity = (candidate.genre === question.genre ? 4 : 0) + (candidate.subgenre === question.subgenre ? 5 : 0) + (Math.floor(candidate.year / 10) === Math.floor(question.year / 10) ? 2 : 0) + (candidate.artist === question.artist ? 1 : 0);
  return difficulty === "hard" ? similarity : difficulty === "easy" ? -similarity : 0;
}

function createAnswers(question, mode, playableQuestions, difficulty) {
  const correctAnswer = answerFor(question, mode);
  const answerCount = DIFFICULTIES[difficulty]?.answers ?? 4;
  const candidates = shuffle(playableQuestions.filter((candidate) => candidate.id !== question.id))
    .sort((left, right) => candidateScore(question, right, difficulty) - candidateScore(question, left, difficulty));
  const distractors = [];
  for (const candidate of candidates) {
    const value = answerFor(candidate, mode);
    if (value && value !== correctAnswer && !distractors.includes(value)) distractors.push(value);
    if (distractors.length === answerCount - 1) break;
  }
  return shuffle([correctAnswer, ...distractors]);
}

export function getQuizPool(source = questions, options = {}) {
  const { scope = "random", genre = "", decade = "" } = options;
  return getPlayableQuestions(source).filter((question) => {
    if (scope === "genre" && genre && question.genre !== genre) return false;
    if (scope === "decade" && decade && Math.floor(question.year / 10) * 10 !== Number(decade)) return false;
    return true;
  });
}

export function createGameQuestions(source = questions, options = {}) {
  const mode = QUIZ_MODES[options.mode] ? options.mode : "title";
  const difficulty = DIFFICULTIES[options.difficulty] ? options.difficulty : "normal";
  const playableQuestions = getPlayableQuestions(source);
  const quizPool = getQuizPool(source, options);
  return shuffle(quizPool).slice(0, Math.min(QUESTIONS_PER_GAME, quizPool.length)).map((question) => ({
    ...question,
    quizMode: mode,
    difficulty,
    question: QUIZ_MODES[mode].prompt,
    correctAnswer: answerFor(question, mode),
    answers: createAnswers(question, mode, playableQuestions, difficulty),
    points: DIFFICULTIES[difficulty].points,
  }));
}
