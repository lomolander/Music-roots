import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createGameQuestions } from "../lib/quizGame.js";

const NEXT_QUESTION_DELAY = 1100;

function formatTime(value) {
  if (!Number.isFinite(value) || value < 0) return "0:00";

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function hasValidPreview(preview) {
  if (typeof preview !== "string" || preview.trim() === "") return false;

  try {
    const url = new URL(preview, window.location.href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeTrackValue(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(feat(?:uring)?|ft)\.?\s+[^()[\]-]+/gi, " ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function isDeezerPreview(preview) {
  try {
    return new URL(preview).hostname.endsWith("dzcdn.net");
  } catch {
    return false;
  }
}

function refreshDeezerPreview(artist, title) {
  return new Promise((resolve, reject) => {
    const callbackName = `musicRootsDeezer${Date.now()}${Math.random()
      .toString(36)
      .slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timeout durante il rinnovo della preview Deezer"));
    }, 12_000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    };

    window[callbackName] = (payload) => {
      const match = payload.data?.find(
        (candidate) =>
          normalizeTrackValue(candidate.title) === normalizeTrackValue(title) &&
          normalizeTrackValue(candidate.artist?.name) === normalizeTrackValue(artist),
      );
      cleanup();

      if (hasValidPreview(match?.preview)) {
        resolve(match.preview);
      } else {
        reject(new Error("Deezer non ha restituito una corrispondenza esatta"));
      }
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Impossibile contattare Deezer"));
    };
    const query = encodeURIComponent(`artist:"${artist}" track:"${title}"`);
    script.src = `https://api.deezer.com/search?q=${query}&limit=10&output=jsonp&callback=${callbackName}`;
    document.head.appendChild(script);
  });
}

function AudioPreview({ preview, artist, title, questionId }) {
  const audioRef = useRef(null);
  const [activePreview, setActivePreview] = useState(
    isDeezerPreview(preview) ? null : preview,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [isResolving, setIsResolving] = useState(isDeezerPreview(preview));
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const isAvailable = hasValidPreview(preview);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const audio = audioRef.current;
    let isCurrent = true;

    if (isDeezerPreview(preview)) {
      refreshDeezerPreview(artist, title)
        .then((refreshedPreview) => {
          if (!isCurrent) return;
          console.info("[Music Roots Player] URL Deezer rinnovato:", refreshedPreview);
          setActivePreview(refreshedPreview);
          setErrorMessage("");
          setIsResolving(false);
        })
        .catch((error) => {
          if (!isCurrent) return;
          console.error("[Music Roots Player] Rinnovo Deezer non riuscito:", error);
          setErrorMessage(error.message);
          setIsResolving(false);
        });
    }

    return () => {
      isCurrent = false;
      if (!audio) return;
      audio.pause();
      if (Number.isFinite(audio.duration)) {
        audio.currentTime = 0;
      }
    };
  }, [artist, preview, title]);

  useEffect(() => {
    if (activePreview) {
      console.info("[Music Roots Player] URL caricato:", activePreview);
    }
  }, [activePreview]);

  useLayoutEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activePreview) return;

    audio.currentTime = 0;
    audio.play().catch((error) => {
      const isExpectedAutoplayBlock =
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "AbortError");

      if (isExpectedAutoplayBlock) {
        console.info(
          "[Music Roots Player] Autoplay non consentito; disponibile il controllo manuale.",
        );
        setIsPlaying(false);
        return;
      }

      console.error("[Music Roots Player] Tentativo autoplay non riuscito:", error);
      setIsPlaying(false);
    });
  }, [activePreview]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !isAvailable) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    try {
      setErrorMessage("");
      await audio.play();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Errore di riproduzione sconosciuto";
      console.error("[Music Roots Player] audio.play() non riuscito:", error);
      setIsPlaying(false);
      setErrorMessage(`Impossibile riprodurre l'anteprima: ${message}`);
    }
  };

  const handleSeek = (event) => {
    const audio = audioRef.current;
    if (!audio || duration <= 0) return;

    const nextTime = (Number(event.target.value) / 100) * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  if (!isAvailable) {
    return (
      <div
        className="quiz-player is-unavailable"
        data-question-id={questionId}
        role="status"
      >
        <span className="player-glow" aria-hidden="true" />
        <div className="player-title">MUSIC ROOTS PLAYER</div>
        <p className="preview-unavailable">Anteprima non disponibile</p>
      </div>
    );
  }

  return (
    <div
      className={`quiz-player${isPlaying ? " is-playing" : ""}`}
      data-question-id={questionId}
    >
      <audio
        ref={audioRef}
        data-question-id={questionId}
        src={activePreview ?? undefined}
        preload="metadata"
        playsInline
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => {
          const nextDuration = event.currentTarget.duration;
          setDuration(nextDuration);
          if (Number.isFinite(nextDuration)) {
            console.info("[Music Roots Player] Durata:", nextDuration);
          }
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onCanPlay={() => {
          console.info("[Music Roots Player] Evento canplay");
          setCanPlay(true);
        }}
        onPlay={() => {
          console.info("[Music Roots Player] Evento play");
          setIsPlaying(true);
        }}
        onPause={() => {
          console.info("[Music Roots Player] Evento pause");
          setIsPlaying(false);
        }}
        onEnded={() => {
          console.info("[Music Roots Player] Evento ended");
          setIsPlaying(false);
        }}
        onError={(event) => {
          const code = event.currentTarget.error?.code;
          const message = `Errore nel caricamento audio${code ? ` (codice ${code})` : ""}.`;
          console.error("[Music Roots Player] Evento error:", event.currentTarget.error);
          setCanPlay(false);
          setIsPlaying(false);
          setErrorMessage(message);
        }}
      />
      <span className="player-glow" aria-hidden="true" />
      <div className="player-title">MUSIC ROOTS PLAYER</div>

      <button
        className="play-button"
        type="button"
        onClick={togglePlayback}
        disabled={isResolving}
        aria-label={isPlaying ? "Metti in pausa" : "Riproduci anteprima"}
        aria-pressed={isPlaying}
      >
        {isResolving
          ? "Caricamento anteprima…"
          : isPlaying
          ? "❚❚ Pausa"
          : canPlay
            ? "▶ Ascolta la clip"
            : "▶ Carica e ascolta"}
      </button>

      {errorMessage && (
        <p className="player-error" role="alert">
          {errorMessage}
        </p>
      )}

      <div
        className={`waveform${isPlaying ? " is-playing" : ""}`}
        aria-hidden="true"
      >
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>

      <div className="audio-progress">
        <div
          className="audio-progress-fill"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        >
          <span className="audio-progress-knob" />
        </div>
        <input
          className="audio-progress-input"
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleSeek}
          aria-label="Posizione dell'anteprima"
        />
      </div>

      <div className="player-time">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

export default function Quiz({ onBack }) {
  const [gameQuestions, setGameQuestions] = useState(createGameQuestions);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const nextQuestionRef = useRef(null);

  const currentQuestion = gameQuestions[questionIndex];
  const quizProgress = ((questionIndex + 1) / gameQuestions.length) * 100;

  useEffect(() => {
    return () => clearTimeout(nextQuestionRef.current);
  }, []);

  const goToNextQuestion = () => {
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

  const restartQuiz = () => {
    clearTimeout(nextQuestionRef.current);
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
            <strong>{correctAnswers} / {gameQuestions.length}</strong>
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
            <button className="primary-button" type="button" onClick={restartQuiz}>
              Rigioca
            </button>
            <button className="secondary-button" type="button" onClick={onBack}>
              Torna alla Home
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell page-enter">
      <section
        className="quiz-screen glass-panel"
        key={currentQuestion.id}
      >
        <div className="quiz-topbar">
          <div>
            <span className="quiz-step">
              Domanda {questionIndex + 1} di {gameQuestions.length}
            </span>
            <div className="quiz-progress" aria-label="Progresso del quiz">
              <div className="quiz-progress-fill" style={{ width: `${quizProgress}%` }} />
            </div>
          </div>
          <div className="score-badge">{score} punti</div>
        </div>

        <button className="back-button" type="button" onClick={onBack}>
          ← Torna alla Home
        </button>

        <p className="eyebrow">QUIZ MUSICALE</p>
        <h1>Indovina il brano</h1>

        <AudioPreview
          key={`player-${currentQuestion.id}`}
          preview={currentQuestion.preview}
          artist={currentQuestion.artist}
          title={currentQuestion.title}
          questionId={currentQuestion.id}
        />

        <p className="quiz-question">{currentQuestion.question}</p>

        <div
          className="answers-grid question-enter"
          key={`answers-${currentQuestion.id}`}
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
