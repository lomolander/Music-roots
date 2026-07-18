import { useEffect, useMemo, useRef, useState } from "react";
import questions from "../data/questions";

const CLIP_DURATION = 30;
const NEXT_QUESTION_DELAY = 1100;
const QUESTIONS_PER_GAME = 10;

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

function createGameQuestions() {
  return shuffle(questions)
    .slice(0, Math.min(QUESTIONS_PER_GAME, questions.length))
    .map((question) => ({
      ...question,
      answers: shuffle(question.answers),
    }));
}

export default function Quiz({ onBack }) {
  const [gameQuestions, setGameQuestions] = useState(createGameQuestions);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef(null);
  const nextQuestionRef = useRef(null);

  const currentQuestion = gameQuestions[questionIndex];
  const audioProgress = Math.min((elapsed / CLIP_DURATION) * 100, 100);
  const quizProgress =
    ((questionIndex + 1) / gameQuestions.length) * 100;

  useEffect(() => {
    if (!isPlaying) {
      clearInterval(timerRef.current);
      return undefined;
    }

    timerRef.current = setInterval(() => {
      setElapsed((current) => {
        if (current >= CLIP_DURATION - 1) {
          setIsPlaying(false);
          return CLIP_DURATION;
        }

        return current + 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(nextQuestionRef.current);
    };
  }, []);

  const formattedTime = useMemo(
    () => `0:${String(elapsed).padStart(2, "0")}`,
    [elapsed],
  );

  const resetPlayer = () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setElapsed(0);
  };

  const goToNextQuestion = () => {
    resetPlayer();
    setSelected(null);

    if (questionIndex === gameQuestions.length - 1) {
      setIsFinished(true);
      return;
    }

    setQuestionIndex((current) => current + 1);
  };

  const handleAnswer = (answer) => {
    if (selected) return;

    setSelected(answer);
    setIsPlaying(false);

    if (answer === currentQuestion.correctAnswer) {
      setScore((current) => current + 10);
    }

    nextQuestionRef.current = setTimeout(
      goToNextQuestion,
      NEXT_QUESTION_DELAY,
    );
  };

  const getAnswerClass = (answer) => {
    if (!selected) return "answer";
    if (answer === currentQuestion.correctAnswer) return "answer correct";
    if (answer === selected) return "answer wrong";
    return "answer muted-answer";
  };

  const togglePlayback = () => {
    if (elapsed >= CLIP_DURATION) {
      setElapsed(0);
    }

    setIsPlaying((current) => !current);
  };

  const restartQuiz = () => {
    clearTimeout(nextQuestionRef.current);
    resetPlayer();
    setGameQuestions(createGameQuestions());
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const correctAnswers = score / 10;

    return (
      <main className="app-shell page-enter">
        <section className="quiz-screen quiz-result glass-panel">
          <p className="eyebrow">QUIZ COMPLETATO</p>
          <h1>Risultato finale</h1>

          <div className="result-score">
            <strong>
              {correctAnswers} / {gameQuestions.length}
            </strong>
            <span>{score} punti</span>
          </div>

          <p className="result-message">
            {correctAnswers >= 8
              ? "Eccellente orecchio musicale."
              : correctAnswers >= 5
                ? "Ottimo risultato. Continua a esplorare."
                : "Buon inizio. Riprova e migliora il punteggio."}
          </p>

          <div className="result-actions">
            <button
              className="primary-button"
              type="button"
              onClick={restartQuiz}
            >
              Rigioca
            </button>

            <button
              className="secondary-button"
              type="button"
              onClick={onBack}
            >
              Torna alla Home
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell page-enter">
      <section className="quiz-screen glass-panel">
        <div className="quiz-topbar">
          <div>
            <span className="quiz-step">
              Domanda {questionIndex + 1} di {gameQuestions.length}
            </span>

            <div className="quiz-progress" aria-label="Progresso del quiz">
              <div
                className="quiz-progress-fill"
                style={{ width: `${quizProgress}%` }}
              />
            </div>
          </div>

          <div className="score-badge">{score} punti</div>
        </div>

        <button className="back-button" type="button" onClick={onBack}>
          ← Torna alla Home
        </button>

        <p className="eyebrow">QUIZ MUSICALE</p>
        <h1>Indovina il brano</h1>

        <div className={`quiz-player${isPlaying ? " is-playing" : ""}`}>
          <span className="player-glow" aria-hidden="true" />
          <div className="player-title">MUSIC ROOTS PLAYER</div>

          <button
            className="play-button"
            type="button"
            onClick={togglePlayback}
            aria-pressed={isPlaying}
          >
            {isPlaying ? "❚❚ Pausa" : "▶ Ascolta la clip"}
          </button>

          <div
            className={`waveform${isPlaying ? " is-playing" : ""}`}
            aria-hidden="true"
          >
            {Array.from({ length: 18 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>

          <div className="audio-progress" aria-hidden="true">
            <div
              className="audio-progress-fill"
              style={{ width: `${audioProgress}%` }}
            >
              <span className="audio-progress-knob" />
            </div>
          </div>

          <div className="player-time">
            <span>{formattedTime}</span>
            <span>0:30</span>
          </div>
        </div>

        <p className="quiz-question">{currentQuestion.question}</p>

        <div
          className="answers-grid question-enter"
          key={currentQuestion.id}
        >
          {currentQuestion.answers.map((answer) => (
            <button
              key={answer}
              type="button"
              className={getAnswerClass(answer)}
              onClick={() => handleAnswer(answer)}
              disabled={selected !== null}
            >
              {answer}
            </button>
          ))}
        </div>

        <p className="quiz-score">
          {selected
            ? selected === currentQuestion.correctAnswer
              ? "Risposta corretta · +10 punti"
              : `Risposta corretta: ${currentQuestion.correctAnswer}`
            : `${currentQuestion.artist} · ${currentQuestion.year} · ${currentQuestion.genre}`}
        </p>
      </section>
    </main>
  );
}
