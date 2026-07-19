import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  createGameQuestions,
  DIFFICULTIES,
  getPlayableQuestions,
  getQuizPool,
  QUIZ_MODES,
} from "../lib/quizGame.js";
import questions from "../data/questions.js";
import {
  ACHIEVEMENTS,
  BADGES,
  levelProgress,
  loadProgress,
  recordQuizResult,
  saveProgress,
} from "../lib/userProgress.js";

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

const AudioPreview = forwardRef(function AudioPreview(
  { preview, questionId, shouldAutoplay, onPlaybackStarted },
  ref,
) {
  const audioRef = useRef(null);
  const playResolvedRef = useRef(false);
  const playingEventRef = useRef(false);
  const playAttemptRef = useRef(0);
  const activePreview = preview;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayPending, setIsPlayPending] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [showTapPrompt, setShowTapPrompt] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const isAvailable = hasValidPreview(preview);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const markPreviewUnavailable = useCallback((reason) => {
    const audio = audioRef.current;
    console.error("[Music Roots Player] Anteprima non disponibile:", reason);
    playAttemptRef.current += 1;
    if (audio && !audio.paused) audio.pause();
    setIsPlaying(false);
    setIsPlayPending(false);
    setCanPlay(false);
    setShowTapPrompt(false);
    setErrorMessage("Anteprima non disponibile");
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      playAttemptRef.current += 1;
      if (!audio) return;
      audio.pause();
      if (Number.isFinite(audio.duration)) {
        audio.currentTime = 0;
      }
    };
  }, [preview]);

  useEffect(() => {
    if (activePreview) {
      console.info("[Music Roots Player] URL caricato:", activePreview);
    }
  }, [activePreview]);

  const playAudio = useCallback(async (mode = "manual") => {
    const audio = audioRef.current;
    if (!audio || !activePreview) {
      setIsPlaying(false);
      setShowTapPrompt(true);
      return false;
    }

    if (!audio.paused) return true;

    const attemptId = playAttemptRef.current + 1;
    playAttemptRef.current = attemptId;

    setErrorMessage("");
    setShowTapPrompt(false);
    setIsPlayPending(true);
    audio.muted = false;
    audio.volume = 1;

    if (!audio.src) {
      audio.src = activePreview;
      audio.load();
    }

    if (
      mode !== "manual" ||
      audio.ended ||
      (Number.isFinite(audio.duration) && audio.currentTime >= audio.duration)
    ) {
      audio.currentTime = 0;
    }
    try {
      playResolvedRef.current = false;
      playingEventRef.current = false;
      let resolvePlaying;
      const playingPromise = new Promise((resolve) => {
        resolvePlaying = resolve;
        audio.addEventListener("playing", resolvePlaying, { once: true });
      });
      const playPromise = audio.play();
      let timeoutId;
      const playbackTimeout = new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(new Error("Timeout: evento playing non ricevuto entro 7 secondi"));
        }, 7_000);
      });
      try {
        await Promise.race([
          Promise.all([playPromise, playingPromise]),
          playbackTimeout,
        ]);
      } finally {
        window.clearTimeout(timeoutId);
        audio.removeEventListener("playing", resolvePlaying);
      }
      if (attemptId !== playAttemptRef.current) return false;
      setIsPlayPending(false);
      playResolvedRef.current = true;
      if (playingEventRef.current && !audio.paused) {
        setIsPlaying(true);
        onPlaybackStarted();
      }
      return !audio.paused;
    } catch (error) {
      if (attemptId !== playAttemptRef.current) return false;
      setIsPlayPending(false);
      const isExpectedAutoplayBlock =
        error instanceof DOMException &&
        error.name === "NotAllowedError";

      if (isExpectedAutoplayBlock || mode === "autoplay") {
        if (!isExpectedAutoplayBlock) {
          markPreviewUnavailable(error);
          return false;
        }
        console.info(
          "[Music Roots Player] Autoplay non consentito; disponibile il controllo manuale.",
        );
        setIsPlaying(false);
        setShowTapPrompt(true);
        return false;
      }

      console.error("[Music Roots Player] audio.play() non riuscito:", error);
      markPreviewUnavailable(error);
      return false;
    }
  }, [activePreview, markPreviewUnavailable, onPlaybackStarted]);

  useImperativeHandle(ref, () => ({
    playInitial: () => playAudio("initial"),
  }), [playAudio]);

  useEffect(() => {
    if (shouldAutoplay && activePreview) {
      const autoplayTimer = window.setTimeout(() => playAudio("autoplay"), 0);
      return () => window.clearTimeout(autoplayTimer);
    }
    return undefined;
  }, [activePreview, playAudio, shouldAutoplay]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !isAvailable) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    await playAudio("manual");
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
        muted={false}
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
        }}
        onPlaying={() => {
          console.info("[Music Roots Player] Evento playing");
          playingEventRef.current = true;
          if (playResolvedRef.current && !audioRef.current?.paused) {
            setIsPlaying(true);
            setShowTapPrompt(false);
            onPlaybackStarted();
          }
        }}
        onPause={() => {
          console.info("[Music Roots Player] Evento pause");
          playResolvedRef.current = false;
          playingEventRef.current = false;
          setIsPlaying(false);
        }}
        onEnded={() => {
          console.info("[Music Roots Player] Evento ended");
          setIsPlaying(false);
        }}
        onWaiting={() => {
          console.info("[Music Roots Player] Evento waiting");
        }}
        onStalled={() => markPreviewUnavailable("Evento stalled")}
        onAbort={() => markPreviewUnavailable("Evento abort")}
        onError={(event) => {
          const code = event.currentTarget.error?.code;
          console.error("[Music Roots Player] Evento error:", event.currentTarget.error);
          markPreviewUnavailable(
            `Evento error${code ? `, codice ${code}` : ""}`,
          );
        }}
      />
      <span className="player-glow" aria-hidden="true" />
      <div className="player-title">MUSIC ROOTS PLAYER</div>

      <button
        className="play-button"
        type="button"
        onClick={togglePlayback}
        disabled={isPlayPending}
        aria-label={isPlaying ? "Metti in pausa" : "Riproduci anteprima"}
        aria-pressed={isPlaying}
      >
        {isPlayPending
          ? "Caricamento anteprima…"
          : errorMessage
            ? "▶ Ascolta la clip"
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

      {showTapPrompt && !errorMessage && (
        <p className="player-tap-prompt" role="status">
          Tocca per ascoltare
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
});

function OptionButton({ active, onClick, children }) {
  return <button className={active ? "quiz-option active" : "quiz-option"} type="button" onClick={onClick}>{children}</button>;
}

function UnlockList({ title, unlocks, definitions }) {
  return <div className="unlock-list"><h2>{title}</h2>{unlocks.map((unlock) => { const item = definitions.find((definition) => definition.id === unlock.id); return <p key={unlock.id}><strong>{item?.name ?? unlock.id}</strong><span>{item?.description}</span></p>; })}</div>;
}

const Quiz = forwardRef(function Quiz({ onBack }, ref) {
  const [screen, setScreen] = useState("setup");
  const [settings, setSettings] = useState({ mode: "title", scope: "random", genre: "", decade: "", difficulty: "normal" });
  const [gameQuestions, setGameQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState([]);
  const [progress, setProgress] = useState(loadProgress);
  const [reward, setReward] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [hasPlaybackPermission, setHasPlaybackPermission] = useState(false);
  const nextQuestionRef = useRef(null);
  const playerRef = useRef(null);

  const currentQuestion = gameQuestions[questionIndex];
  const quizProgress = gameQuestions.length ? ((questionIndex + 1) / gameQuestions.length) * 100 : 0;
  const playable = getPlayableQuestions(questions);
  const genreOptions = [...new Set(playable.map((question) => question.genre))].sort((left, right) => left.localeCompare(right, "it"));
  const decadeOptions = [...new Set(playable.map((question) => Math.floor(question.year / 10) * 10))].sort((left, right) => left - right);
  const availableQuestions = getQuizPool(questions, settings).length;

  useEffect(() => {
    return () => clearTimeout(nextQuestionRef.current);
  }, []);

  useImperativeHandle(ref, () => ({
    startInitialPlayback: () => playerRef.current?.playInitial(),
  }), []);

  const goToNextQuestion = (finalAnswers = sessionAnswers, finalScore = score) => {
    setSelected(null);

    if (questionIndex === gameQuestions.length - 1) {
      const result = recordQuizResult(progress, { ...settings, score: finalScore, answers: finalAnswers });
      setProgress(result.progress);
      saveProgress(result.progress);
      setReward(result);
      setIsFinished(true);
      return;
    }

    setQuestionIndex((current) => current + 1);
  };

  const handleAnswer = (answer) => {
    if (selected) return;

    setSelected(answer);

    const isCorrect = answer === currentQuestion.correctAnswer;
    const nextScore = score + (isCorrect ? currentQuestion.points : 0);
    const nextAnswers = [...sessionAnswers, { trackId: currentQuestion.id, genre: currentQuestion.genre, correct: isCorrect }];
    setSessionAnswers(nextAnswers);

    if (isCorrect) {
      setScore((current) => current + currentQuestion.points);
      setCorrectCount((current) => current + 1);
    }

    nextQuestionRef.current = setTimeout(
      () => goToNextQuestion(nextAnswers, nextScore),
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
    setGameQuestions(createGameQuestions(questions, settings));
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setCorrectCount(0);
    setSessionAnswers([]);
    setReward(null);
    setIsFinished(false);
    setHasPlaybackPermission(false);
    setScreen("game");
  };

  const startConfiguredQuiz = () => {
    const game = createGameQuestions(questions, settings);
    if (!game.length) return;
    setGameQuestions(game);
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setCorrectCount(0);
    setSessionAnswers([]);
    setReward(null);
    setIsFinished(false);
    setHasPlaybackPermission(false);
    setScreen("game");
  };

  const changeSettings = (key, value) => setSettings((current) => ({
    ...current,
    [key]: value,
    ...(key === "scope" ? { genre: "", decade: "" } : {}),
  }));

  if (screen === "setup") {
    const levelState = levelProgress(progress.xp);
    return (
      <main className="app-shell page-enter">
        <section className="quiz-screen quiz-setup glass-panel">
          <button className="back-button" type="button" onClick={onBack}>← Torna alla Home</button>
          <div className="quiz-level-summary"><span>Livello {progress.level}</span><strong>{progress.xp} XP</strong><div><i style={{ width: `${(levelState.current / levelState.required) * 100}%` }} /></div></div>
          <p className="eyebrow">QUIZ MUSICALE</p><h1>Scegli la sfida</h1>
          <fieldset className="quiz-options"><legend>Modalità</legend><div className="quiz-option-grid">{Object.entries(QUIZ_MODES).map(([id, item]) => <OptionButton key={id} active={settings.mode === id} onClick={() => changeSettings("mode", id)}>{item.label}</OptionButton>)}</div></fieldset>
          <fieldset className="quiz-options"><legend>Percorso</legend><div className="quiz-option-grid three-columns"><OptionButton active={settings.scope === "random"} onClick={() => changeSettings("scope", "random")}>Quiz casuale</OptionButton><OptionButton active={settings.scope === "genre"} onClick={() => changeSettings("scope", "genre")}>Singolo genere</OptionButton><OptionButton active={settings.scope === "decade"} onClick={() => changeSettings("scope", "decade")}>Decennio</OptionButton></div></fieldset>
          {settings.scope === "genre" && <label className="quiz-select-label">Genere<select value={settings.genre} onChange={(event) => changeSettings("genre", event.target.value)}><option value="">Seleziona un genere</option>{genreOptions.map((name) => <option key={name}>{name}</option>)}</select></label>}
          {settings.scope === "decade" && <label className="quiz-select-label">Decennio<select value={settings.decade} onChange={(event) => changeSettings("decade", event.target.value)}><option value="">Seleziona un decennio</option>{decadeOptions.map((value) => <option key={value} value={value}>Anni {value}</option>)}</select></label>}
          <fieldset className="quiz-options"><legend>Difficoltà</legend><div className="quiz-option-grid three-columns">{Object.entries(DIFFICULTIES).map(([id, item]) => <OptionButton key={id} active={settings.difficulty === id} onClick={() => changeSettings("difficulty", id)}>{item.label}<small>{item.points} punti</small></OptionButton>)}</div></fieldset>
          <p className="quiz-availability">{availableQuestions} brani verificati disponibili · fino a 10 domande</p>
          <button className="primary-button" type="button" onClick={startConfiguredQuiz} disabled={!availableQuestions || (settings.scope === "genre" && !settings.genre) || (settings.scope === "decade" && !settings.decade)}>Inizia il quiz</button>
        </section>
      </main>
    );
  }

  if (isFinished) {
    return (
      <main className="app-shell page-enter">
        <section className="quiz-screen quiz-result glass-panel">
          <p className="eyebrow">QUIZ COMPLETATO</p>
          <h1>Risultato finale</h1>

          <div className="result-score">
            <strong>{correctCount} / {gameQuestions.length}</strong>
            <span>{score} punti</span>
          </div>

          {reward && <section className="quiz-rewards"><div><strong>+{reward.earnedXp} XP</strong><span>Livello {progress.level}{reward.leveledUp ? " · Nuovo livello!" : ""}</span></div>{reward.newBadges.length > 0 && <UnlockList title="Nuovi badge" unlocks={reward.newBadges} definitions={BADGES} />}{reward.newAchievements.length > 0 && <UnlockList title="Nuovi obiettivi" unlocks={reward.newAchievements} definitions={ACHIEVEMENTS} />}</section>}

          <p className="result-message">
            {correctCount >= Math.ceil(gameQuestions.length * 0.8)
              ? "Eccellente orecchio musicale."
              : correctCount >= Math.ceil(gameQuestions.length * 0.5)
                ? "Ottimo risultato. Continua a esplorare."
                : "Buon inizio. Riprova e migliora il punteggio."}
          </p>

          <div className="result-actions">
            <button className="primary-button" type="button" onClick={restartQuiz}>
              Rigioca
            </button>
            <button className="secondary-button" type="button" onClick={() => setScreen("setup")}>
              Cambia modalità
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
        <h1>{QUIZ_MODES[currentQuestion.quizMode].label}</h1>

        <AudioPreview
          ref={playerRef}
          key={`player-${currentQuestion.id}`}
          preview={currentQuestion.preview}
          artist={currentQuestion.artist}
          title={currentQuestion.title}
          questionId={currentQuestion.id}
          shouldAutoplay={hasPlaybackPermission}
          onPlaybackStarted={() => setHasPlaybackPermission(true)}
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
              ? `Risposta corretta · +${currentQuestion.points} punti`
              : `Risposta corretta: ${currentQuestion.correctAnswer} · ${currentQuestion.artist} · ${currentQuestion.year} · ${currentQuestion.genre}`
            : `${DIFFICULTIES[currentQuestion.difficulty].label} · ascolta con attenzione`}
        </p>
      </section>
    </main>
  );
});

export default Quiz;
