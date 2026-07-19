import { Award, BarChart3, CheckCircle2, Headphones, Medal, Star, Target, Trophy } from "lucide-react";

import { DIFFICULTIES, QUIZ_MODES } from "../lib/quizGame.js";
import { ACHIEVEMENTS, BADGES, levelProgress, loadProgress } from "../lib/userProgress.js";

const percentage = (correct, total) => total ? Math.round((correct / total) * 100) : 0;

function Profile({ onBack }) {
  const progress = loadProgress();
  const stats = progress.stats;
  const level = levelProgress(progress.xp);
  const accuracy = percentage(stats.correctAnswers, stats.totalAnswers);
  const obtainedBadgeIds = new Set(progress.badges.map((badge) => badge.id));
  const obtainedAchievementIds = new Set(progress.achievements.map((achievement) => achievement.id));
  const bestGenres = Object.entries(stats.byGenre)
    .map(([genre, result]) => ({ genre, ...result, accuracy: percentage(result.correct, result.answers) }))
    .sort((left, right) => right.correct - left.correct || right.accuracy - left.accuracy || right.answers - left.answers)
    .slice(0, 6);

  return (
    <main className="app-shell profile-screen page-enter">
      <header className="explore-header"><button className="back-button" type="button" onClick={onBack}>← Indietro</button><span className="explore-count">Profilo locale</span></header>

      <section className="profile-hero glass-panel">
        <span className="profile-level-icon"><Star /></span>
        <div><p className="eyebrow">PROGRESSIONE UTENTE</p><h1>Livello {progress.level}</h1><p>{progress.xp} XP totali</p></div>
        <div className="profile-level-progress"><span><strong>{level.current} XP</strong><small>{level.required} XP per il prossimo livello</small></span><div><i style={{ width: `${(level.current / level.required) * 100}%` }} /></div></div>
      </section>

      <section className="profile-stats" aria-label="Statistiche principali">
        <Stat icon={Trophy} value={stats.quizzesCompleted} label="Quiz completati" />
        <Stat icon={Target} value={`${accuracy}%`} label="Accuratezza" />
        <Stat icon={CheckCircle2} value={stats.correctAnswers} label="Risposte corrette" />
        <Stat icon={Headphones} value={stats.totalAnswers} label="Brani ascoltati" />
      </section>

      <ProfileSection icon={Medal} title="Badge" count={`${progress.badges.length}/${BADGES.length}`}>
        <div className="badge-grid">{BADGES.map((badge) => <article className={obtainedBadgeIds.has(badge.id) ? "badge-card unlocked" : "badge-card locked"} key={badge.id}><Award /><strong>{badge.name}</strong><p>{badge.description}</p><small>{obtainedBadgeIds.has(badge.id) ? "Ottenuto" : "Da sbloccare"}</small></article>)}</div>
      </ProfileSection>

      <ProfileSection icon={Target} title="Obiettivi" count={`${progress.achievements.length}/${ACHIEVEMENTS.length}`}>
        <div className="achievement-list">{ACHIEVEMENTS.map((achievement) => <article className={obtainedAchievementIds.has(achievement.id) ? "unlocked" : "locked"} key={achievement.id}><CheckCircle2 /><span><strong>{achievement.name}</strong><small>{achievement.description}</small></span></article>)}</div>
      </ProfileSection>

      <ProfileSection icon={BarChart3} title="Generi migliori">
        {bestGenres.length ? <div className="genre-performance">{bestGenres.map((item) => <article key={item.genre}><div><strong>{item.genre}</strong><span>{item.correct}/{item.answers} · {item.accuracy}%</span></div><div><i style={{ width: `${item.accuracy}%` }} /></div></article>)}</div> : <EmptyState>Completa un quiz per vedere i tuoi generi migliori.</EmptyState>}
      </ProfileSection>

      <ProfileSection icon={Headphones} title="Ultimi risultati">
        {stats.recentResults.length ? <div className="recent-results">{stats.recentResults.map((result, index) => <article key={`${result.date}-${index}`}><span><strong>{QUIZ_MODES[result.mode]?.label ?? result.mode}</strong><small>{DIFFICULTIES[result.difficulty]?.label ?? result.difficulty} · {scopeLabel(result)}</small></span><span><strong>{result.correct}/{result.total}</strong><small>+{result.earnedXp} XP</small></span></article>)}</div> : <EmptyState>I risultati dei quiz completati compariranno qui.</EmptyState>}
      </ProfileSection>
    </main>
  );
}

function scopeLabel(result) {
  if (result.scope === "genre") return "Quiz per genere";
  if (result.scope === "decade") return "Quiz per decennio";
  return "Quiz casuale";
}

function Stat({ icon: Icon, value, label }) {
  return <article><Icon aria-hidden="true" /><strong>{value}</strong><small>{label}</small></article>;
}

function ProfileSection({ icon: Icon, title, count, children }) {
  return <section className="profile-section"><header><h2><Icon aria-hidden="true" />{title}</h2>{count && <span>{count}</span>}</header>{children}</section>;
}

function EmptyState({ children }) { return <p className="profile-empty">{children}</p>; }

export default Profile;
