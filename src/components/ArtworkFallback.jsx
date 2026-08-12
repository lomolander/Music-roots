import { Music2 } from "lucide-react";

function initials(value) {
  return String(value || "Music Roots")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ArtworkFallback({ title, artist, compact = false, className = "" }) {
  return (
    <span
      className={`artwork-fallback${compact ? " is-compact" : ""}${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={`Artwork non disponibile${title ? ` per ${title}` : ""}`}
    >
      <span className="artwork-fallback-mark" aria-hidden="true">{initials(artist || title)}</span>
      {!compact ? <span className="artwork-fallback-copy"><strong>{title || "Music Roots"}</strong>{artist ? <small>{artist}</small> : null}</span> : null}
      <Music2 className="artwork-fallback-icon" aria-hidden="true" />
    </span>
  );
}
