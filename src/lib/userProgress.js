const STORAGE_KEY = "music-roots-progress-v1";
const XP_PER_LEVEL = 500;

export const BADGES = [
  { id: "curioso", name: "Curioso", description: "Completa il primo quiz." },
  { id: "esploratore", name: "Esploratore", description: "Gioca almeno tre modalità diverse." },
  { id: "collezionista", name: "Collezionista", description: "Completa dieci quiz." },
  { id: "storico", name: "Storico della Musica", description: "Rispondi correttamente a 250 domande." },
  { id: "expert-house", name: "Esperto House", description: "Ottieni almeno 20 risposte House corrette con il 70% di accuratezza." },
  { id: "expert-jazz", name: "Esperto Jazz", description: "Ottieni almeno 20 risposte Jazz corrette con il 70% di accuratezza." },
  { id: "expert-trip-hop", name: "Esperto Trip Hop", description: "Ottieni almeno 20 risposte Trip Hop corrette con il 70% di accuratezza." },
  { id: "expert-funk", name: "Esperto Funk", description: "Ottieni almeno 20 risposte Funk corrette con il 70% di accuratezza." },
  { id: "expert-synth-pop", name: "Esperto Synthpop", description: "Ottieni almeno 20 risposte Synth-pop corrette con il 70% di accuratezza." },
  { id: "expert-soul", name: "Esperto Soul", description: "Ottieni almeno 20 risposte Soul corrette con il 70% di accuratezza." },
];

export const ACHIEVEMENTS = [
  { id: "first-answer", name: "Prima scoperta", description: "Dai la prima risposta corretta." },
  { id: "perfect-game", name: "Quiz perfetto", description: "Completa un quiz senza errori." },
  { id: "five-quizzes", name: "Costanza", description: "Completa cinque quiz." },
  { id: "hundred-answers", name: "Cento ascolti", description: "Rispondi a cento domande." },
  { id: "all-modes", name: "Orecchio completo", description: "Prova tutte le modalità del quiz." },
];

export function createInitialProgress() {
  return { version: 1, xp: 0, level: 1, badges: [], achievements: [], stats: { quizzesCompleted: 0, totalAnswers: 0, correctAnswers: 0, byGenre: {}, modes: {}, recentResults: [] } };
}

export function levelForXp(xp) { return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1; }
export function levelProgress(xp) { const level = levelForXp(xp); return { level, current: xp - ((level - 1) * XP_PER_LEVEL), required: XP_PER_LEVEL, nextLevelXp: level * XP_PER_LEVEL }; }

function hasUnlock(items, id) { return items.some((item) => item.id === id); }
function unlock(items, definition, unlockedAt) { return hasUnlock(items, definition.id) ? items : [...items, { id: definition.id, unlockedAt }]; }
function definition(list, id) { return list.find((item) => item.id === id); }

function evaluateUnlocks(progress, unlockedAt) {
  let badges = [...progress.badges];
  let achievements = [...progress.achievements];
  const stats = progress.stats;
  if (stats.quizzesCompleted >= 1) badges = unlock(badges, definition(BADGES, "curioso"), unlockedAt);
  if (Object.keys(stats.modes).length >= 3) badges = unlock(badges, definition(BADGES, "esploratore"), unlockedAt);
  if (stats.quizzesCompleted >= 10) badges = unlock(badges, definition(BADGES, "collezionista"), unlockedAt);
  if (stats.correctAnswers >= 250) badges = unlock(badges, definition(BADGES, "storico"), unlockedAt);
  const expertGenres = { House: "expert-house", Jazz: "expert-jazz", "Trip Hop": "expert-trip-hop", Funk: "expert-funk", "Synth-pop": "expert-synth-pop", Soul: "expert-soul" };
  for (const [genre, id] of Object.entries(expertGenres)) {
    const result = stats.byGenre[genre];
    if (result?.correct >= 20 && result.correct / result.answers >= 0.7) badges = unlock(badges, definition(BADGES, id), unlockedAt);
  }
  if (stats.correctAnswers >= 1) achievements = unlock(achievements, definition(ACHIEVEMENTS, "first-answer"), unlockedAt);
  if (stats.recentResults[0]?.correct === stats.recentResults[0]?.total && stats.recentResults[0]?.total > 0) achievements = unlock(achievements, definition(ACHIEVEMENTS, "perfect-game"), unlockedAt);
  if (stats.quizzesCompleted >= 5) achievements = unlock(achievements, definition(ACHIEVEMENTS, "five-quizzes"), unlockedAt);
  if (stats.totalAnswers >= 100) achievements = unlock(achievements, definition(ACHIEVEMENTS, "hundred-answers"), unlockedAt);
  if (Object.keys(stats.modes).length >= 5) achievements = unlock(achievements, definition(ACHIEVEMENTS, "all-modes"), unlockedAt);
  return { ...progress, badges, achievements };
}

export function recordQuizResult(current, session, now = new Date().toISOString()) {
  const base = current?.version === 1 ? current : createInitialProgress();
  const answers = session.answers ?? [];
  const correct = answers.filter((answer) => answer.correct).length;
  const earnedXp = Math.max(0, session.score ?? 0) + 25 + (answers.length > 0 && correct === answers.length ? 50 : 0);
  const byGenre = structuredClone(base.stats.byGenre ?? {});
  for (const answer of answers) {
    const item = byGenre[answer.genre] ?? { answers: 0, correct: 0 };
    item.answers += 1;
    if (answer.correct) item.correct += 1;
    byGenre[answer.genre] = item;
  }
  const modes = { ...(base.stats.modes ?? {}), [session.mode]: ((base.stats.modes ?? {})[session.mode] ?? 0) + 1 };
  const recent = { date: now, mode: session.mode, scope: session.scope, difficulty: session.difficulty, score: session.score, correct, total: answers.length, earnedXp };
  const next = { ...base, xp: base.xp + earnedXp, stats: { ...base.stats, quizzesCompleted: base.stats.quizzesCompleted + 1, totalAnswers: base.stats.totalAnswers + answers.length, correctAnswers: base.stats.correctAnswers + correct, byGenre, modes, recentResults: [recent, ...(base.stats.recentResults ?? [])].slice(0, 10) } };
  next.level = levelForXp(next.xp);
  const evaluated = evaluateUnlocks(next, now);
  return { progress: evaluated, earnedXp, newBadges: evaluated.badges.filter((item) => !hasUnlock(base.badges, item.id)), newAchievements: evaluated.achievements.filter((item) => !hasUnlock(base.achievements, item.id)), leveledUp: evaluated.level > base.level };
}

export function loadProgress() {
  if (typeof window === "undefined") return createInitialProgress();
  try { return { ...createInitialProgress(), ...JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null") }; } catch { return createInitialProgress(); }
}

export function saveProgress(progress) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
