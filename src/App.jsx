import lomolanderLogo from "./assets/lomolander-logo.png";
import { useState } from "react";
import { Music2, Share2, MapPin, Route } from "lucide-react";

import Quiz from "./pages/Quiz";

const sections = [
  {
    title: "Quiz",
    description: "Metti alla prova il tuo orecchio e le tue conoscenze musicali.",
    icon: Music2,
    action: "quiz",
  },
  {
    title: "Esplora",
    description: "Scopri generi, sottogeneri e connessioni.",
    icon: Share2,
  },
  {
    title: "Scenari",
    description: "Luoghi, epoche e movimenti che hanno cambiato la musica.",
    icon: MapPin,
  },
  {
    title: "Percorsi Sonori",
    description: "Segui l'evoluzione della musica attraverso storie guidate.",
    icon: Route,
  },
];

export default function App() {
  const [screen, setScreen] = useState("home");

  if (screen === "quiz") {
    return <Quiz onBack={() => setScreen("home")} />;
  }

  return (
    <main className="app-shell page-enter">
      <header className="site-header">
        <div className="brand-mark brand-logo-wrap">
         <img
  src={lomolanderLogo}
  alt="LomolanderMusicHub"
  className="brand-logo"
/>
        </div>

        <div>
          <p className="brand-name">Music Roots</p>
          <p className="brand-signature">by LomolanderMusicHub</p>
        </div>
      </header>

      <section className="hero glass-panel">
        <span className="panel-sheen" aria-hidden="true" />
        <p className="eyebrow">MUSIC DISCOVERY</p>

        <h1>
          Ascolta.
          <br />
          Scopri.
          <br />
          Collega.
        </h1>

        <p className="hero-copy">
          Quiz musicali, generi, scenari e percorsi per scoprire le radici
          della musica.
        </p>

        <button
          className="primary-button"
          type="button"
          onClick={() => setScreen("quiz")}
        >
          Inizia il quiz
        </button>
      </section>

      <section className="section-grid" aria-label="Sezioni principali">
        {sections.map((section, index) => {
          const Icon = section.icon;

          return (
            <button
              className="section-card glass-card"
              style={{ "--card-delay": `${index * 65}ms` }}
              type="button"
              key={section.title}
              onClick={() => {
                if (section.action === "quiz") {
                  setScreen("quiz");
                }
              }}
            >
              <span>
                <strong>{section.title}</strong>
                <small>{section.description}</small>
              </span>

              <span className="card-sheen" aria-hidden="true" />
              <span className="section-icon-box" aria-hidden="true">
                <Icon className="section-icon" />
              </span>
            </button>
          );
        })}
      </section>

      <footer className="site-footer">Music Roots · Beta 1.0</footer>
    </main>
  );
}
