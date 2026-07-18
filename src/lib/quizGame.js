import questions from "../data/questions.js";

export const QUESTIONS_PER_GAME = 10;
const ANSWERS_PER_QUESTION = 4;

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function hasValidHttpsPreview(preview) {
  if (typeof preview !== "string" || preview.trim() === "") return false;

  try {
    return new URL(preview).protocol === "https:";
  } catch {
    return false;
  }
}

export function getPlayableQuestions(source = questions) {
  return source.filter(
    (question) =>
      question.previewSource === "apple" &&
      question.previewValidated === true &&
      hasValidHttpsPreview(question.preview),
  );
}

function createAnswers(question, playableQuestions) {
  const playableTitles = new Set(
    playableQuestions.map((candidate) => candidate.title),
  );
  const preferredDistractors = question.answers.filter(
    (answer) =>
      answer !== question.correctAnswer && playableTitles.has(answer),
  );
  const fallbackDistractors = shuffle(
    playableQuestions
      .map((candidate) => candidate.title)
      .filter((title) => title !== question.correctAnswer),
  );
  const distractors = [...new Set([
    ...preferredDistractors,
    ...fallbackDistractors,
  ])].slice(0, ANSWERS_PER_QUESTION - 1);

  return shuffle([question.correctAnswer, ...distractors]);
}

export function createGameQuestions(source = questions) {
  const playableQuestions = getPlayableQuestions(source);

  return shuffle(playableQuestions)
    .slice(0, Math.min(QUESTIONS_PER_GAME, playableQuestions.length))
    .map((question) => ({
      ...question,
      answers: createAnswers(question, playableQuestions),
    }));
}
