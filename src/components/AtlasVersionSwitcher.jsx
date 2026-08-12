function AtlasVersionSwitcher({ version, onChange }) {
  return (
    <div className="atlas-version-switcher" aria-label="Versione dell'Atlante">
      <span>CONFRONTO</span>
      <div>
        <button className={version === "v1" ? "active" : ""} type="button" onClick={() => onChange("v1")} aria-pressed={version === "v1"}>V1 · Card</button>
        <button className={version === "v2" ? "active" : ""} type="button" onClick={() => onChange("v2")} aria-pressed={version === "v2"}>V2 · Mappa</button>
      </div>
    </div>
  );
}

export default AtlasVersionSwitcher;
