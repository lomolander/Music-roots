import questions from "../src/data/questions.js";
import {
  createGameQuestions,
  getPlayableQuestions,
  hasValidHttpsPreview,
  QUESTIONS_PER_GAME,
} from "../src/lib/quizGame.js";

const GAMES_TO_SIMULATE = 1000;
const playableQuestions = getPlayableQuestions(questions);
const playableTitles = new Set(playableQuestions.map((question) => question.title));
const failures = [];

for (let gameIndex = 0; gameIndex < GAMES_TO_SIMULATE; gameIndex += 1) {
  const game = createGameQuestions(questions);
  const ids = new Set(game.map((question) => question.id));

  if (game.length !== QUESTIONS_PER_GAME) {
    failures.push(`Partita ${gameIndex + 1}: ${game.length} domande anziché ${QUESTIONS_PER_GAME}`);
  }
  if (ids.size !== game.length) {
    failures.push(`Partita ${gameIndex + 1}: contiene domande duplicate`);
  }

  for (const question of game) {
    if (!hasValidHttpsPreview(question.preview)) {
      failures.push(`Partita ${gameIndex + 1}, ID ${question.id}: preview non valida`);
    }
    if (question.answers.length !== 4) {
      failures.push(`Partita ${gameIndex + 1}, ID ${question.id}: ${question.answers.length} opzioni`);
    }
    if (!question.answers.includes(question.correctAnswer)) {
      failures.push(`Partita ${gameIndex + 1}, ID ${question.id}: risposta corretta assente`);
    }
    if (new Set(question.answers).size !== question.answers.length) {
      failures.push(`Partita ${gameIndex + 1}, ID ${question.id}: opzioni duplicate`);
    }
    if (question.answers.some((answer) => !playableTitles.has(answer))) {
      failures.push(`Partita ${gameIndex + 1}, ID ${question.id}: opzione fuori dal pool filtrato`);
    }
  }
}

const result = {
  totalDatabaseRecords: questions.length,
  playableRecords: playableQuestions.length,
  excludedRecords: questions.length - playableQuestions.length,
  simulatedGames: GAMES_TO_SIMULATE,
  simulatedQuestions: GAMES_TO_SIMULATE * QUESTIONS_PER_GAME,
  failures: failures.length,
};

console.log(JSON.stringify(result, null, 2));
if (failures.length > 0) {
  console.error(failures.slice(0, 20).join("\n"));
  process.exitCode = 1;
}
