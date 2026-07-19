import questions from "../src/data/questions.js";
import {
  answerFor,
  createGameQuestions,
  DIFFICULTIES,
  getPlayableQuestions,
  getQuizPool,
  hasValidHttpsPreview,
  QUESTIONS_PER_GAME,
  QUIZ_MODES,
} from "../src/lib/quizGame.js";

const GAMES_PER_CONFIGURATION = 100;
const playableQuestions = getPlayableQuestions(questions);
const failures = [];
const answerPositions = [0, 0, 0, 0];
let simulatedGames = 0;
let simulatedQuestions = 0;

const configurations = [];
for (const mode of Object.keys(QUIZ_MODES)) {
  for (const difficulty of Object.keys(DIFFICULTIES)) configurations.push({ mode, difficulty, scope: "random" });
}

const largestGenre = [...new Set(playableQuestions.map((question) => question.genre))]
  .map((genre) => ({ genre, count: getQuizPool(questions, { scope: "genre", genre }).length }))
  .sort((left, right) => right.count - left.count)[0];
const largestDecade = [...new Set(playableQuestions.map((question) => Math.floor(question.year / 10) * 10))]
  .map((decade) => ({ decade, count: getQuizPool(questions, { scope: "decade", decade }).length }))
  .sort((left, right) => right.count - left.count)[0];
configurations.push({ mode: "title", difficulty: "normal", scope: "genre", genre: largestGenre.genre });
configurations.push({ mode: "artist", difficulty: "hard", scope: "decade", decade: largestDecade.decade });

for (const options of configurations) {
  const expectedPool = getQuizPool(questions, options);
  for (let gameIndex = 0; gameIndex < GAMES_PER_CONFIGURATION; gameIndex += 1) {
    const game = createGameQuestions(questions, options);
    const expectedLength = Math.min(QUESTIONS_PER_GAME, expectedPool.length);
    simulatedGames += 1;
    simulatedQuestions += game.length;
    if (game.length !== expectedLength) failures.push(`${JSON.stringify(options)}: ${game.length} domande anziché ${expectedLength}`);
    if (new Set(game.map((question) => question.id)).size !== game.length) failures.push(`${JSON.stringify(options)}: domande duplicate`);

    for (const question of game) {
      if (!hasValidHttpsPreview(question.preview) || question.previewSource !== "apple" || question.previewValidated !== true || question.appleMatchStatus !== "verified") failures.push(`ID ${question.id}: preview non verificata`);
      if (question.correctAnswer !== answerFor(question, options.mode)) failures.push(`ID ${question.id}: risposta errata per modalità ${options.mode}`);
      if (!question.answers.includes(question.correctAnswer) || new Set(question.answers).size !== question.answers.length) failures.push(`ID ${question.id}: opzioni non valide`);
      if (question.answers.length !== DIFFICULTIES[options.difficulty].answers) failures.push(`ID ${question.id}: numero opzioni errato per ${options.difficulty}`);
      if (options.scope === "genre" && question.genre !== options.genre) failures.push(`ID ${question.id}: fuori dal genere selezionato`);
      if (options.scope === "decade" && Math.floor(question.year / 10) * 10 !== Number(options.decade)) failures.push(`ID ${question.id}: fuori dal decennio selezionato`);
      answerPositions[question.answers.indexOf(question.correctAnswer)] += 1;
    }
  }
}

const result = {
  totalDatabaseRecords: questions.length,
  playableRecords: playableQuestions.length,
  excludedRecords: questions.length - playableQuestions.length,
  modesTested: Object.keys(QUIZ_MODES),
  difficultiesTested: Object.keys(DIFFICULTIES),
  scopesTested: ["random", "genre", "decade"],
  configurationsTested: configurations.length,
  simulatedGames,
  simulatedQuestions,
  failures: failures.length,
  correctAnswerPositions: answerPositions,
};

console.log(JSON.stringify(result, null, 2));
if (failures.length) { console.error(failures.slice(0, 30).join("\n")); process.exitCode = 1; }
