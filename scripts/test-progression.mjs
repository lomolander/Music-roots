import { createInitialProgress, levelForXp, recordQuizResult } from "../src/lib/userProgress.js";

const failures = [];
let progress = createInitialProgress();
const session = (mode, genre = "House", correct = 10) => ({ mode, scope: "random", difficulty: "normal", score: correct * 10, answers: Array.from({ length: 10 }, (_, index) => ({ genre, correct: index < correct })) });

let result = recordQuizResult(progress, session("title"), "2026-01-01T00:00:00.000Z");
progress = result.progress;
if (result.earnedXp !== 175 || progress.xp !== 175) failures.push("XP del quiz perfetto non corretto");
if (!result.newBadges.some((item) => item.id === "curioso")) failures.push("Badge Curioso non assegnato");
if (!result.newAchievements.some((item) => item.id === "perfect-game")) failures.push("Obiettivo Quiz perfetto non assegnato");

for (const mode of ["artist", "year", "genre", "subgenre"]) { result = recordQuizResult(progress, session(mode), `2026-01-0${progress.stats.quizzesCompleted + 1}T00:00:00.000Z`); progress = result.progress; }
if (!progress.badges.some((item) => item.id === "esploratore")) failures.push("Badge Esploratore non assegnato");
if (!progress.achievements.some((item) => item.id === "all-modes")) failures.push("Obiettivo di tutte le modalità non assegnato");
if (!progress.badges.some((item) => item.id === "expert-house")) failures.push("Badge Esperto House non assegnato");
if (progress.level !== levelForXp(progress.xp)) failures.push("Livello non coerente con XP");
if (progress.stats.recentResults.length !== 5) failures.push("Cronologia risultati non aggiornata");

for (let index = 0; index < 20; index += 1) {
  result = recordQuizResult(progress, session("title", "Jazz"), `2026-02-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`);
  progress = result.progress;
}
if (!progress.badges.some((item) => item.id === "collezionista")) failures.push("Badge Collezionista non assegnato");
if (!progress.badges.some((item) => item.id === "storico")) failures.push("Badge Storico della Musica non assegnato");
if (!progress.badges.some((item) => item.id === "expert-jazz")) failures.push("Badge Esperto Jazz non assegnato");
if (!progress.achievements.some((item) => item.id === "hundred-answers")) failures.push("Obiettivo Cento ascolti non assegnato");
if (progress.stats.recentResults.length !== 10) failures.push("Cronologia non limitata a dieci risultati");

console.log(JSON.stringify({ xp: progress.xp, level: progress.level, badges: progress.badges.map((item) => item.id), achievements: progress.achievements.map((item) => item.id), quizzes: progress.stats.quizzesCompleted, failures: failures.length }, null, 2));
if (failures.length) { console.error(failures.join("\n")); process.exitCode = 1; }
