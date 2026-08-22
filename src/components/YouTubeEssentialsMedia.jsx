import { useEffect, useRef } from "react";

let iframeApiPromise;

const loadYouTubeIframeApi = () => {
  if (globalThis.YT?.Player) return Promise.resolve(globalThis.YT);
  if (iframeApiPromise) return iframeApiPromise;
  iframeApiPromise = new Promise((resolve, reject) => {
    const previous = globalThis.onYouTubeIframeAPIReady;
    globalThis.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(globalThis.YT);
    };
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => reject(new Error("YouTube IFrame API non disponibile"));
      document.head.appendChild(script);
    }
  });
  return iframeApiPromise;
};

function YouTubeEssentialsMedia({ videoId, playbackIntentRef, onController, onReady, onPlay, onPause, onEnded, onError, onProgress }) {
  const hostRef = useRef(null);
  const callbacksRef = useRef({ onReady, onPlay, onPause, onEnded, onError, onProgress });

  useEffect(() => {
    callbacksRef.current = { onReady, onPlay, onPause, onEnded, onError, onProgress };
  }, [onEnded, onError, onPause, onPlay, onProgress, onReady]);

  useEffect(() => {
    let disposed = false;
    let player = null;
    let progressTimer = null;
    const stopProgress = () => { clearInterval(progressTimer); progressTimer = null; };

    loadYouTubeIframeApi().then((YT) => {
      if (disposed || !hostRef.current) return;
      player = new YT.Player(hostRef.current, {
        videoId,
        width: "100%",
        height: "220",
        playerVars: { playsinline: 1, rel: 0, origin: window.location.origin },
        events: {
          onReady: (event) => {
            onController(event.target);
            callbacksRef.current.onReady?.(event.target);
            if (playbackIntentRef.current) event.target.playVideo();
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              callbacksRef.current.onPlay?.();
              stopProgress();
              progressTimer = setInterval(() => callbacksRef.current.onProgress?.(event.target.getCurrentTime(), event.target.getDuration()), 500);
            } else if (event.data === YT.PlayerState.PAUSED) {
              stopProgress();
              callbacksRef.current.onPause?.();
            } else if (event.data === YT.PlayerState.ENDED) {
              stopProgress();
              callbacksRef.current.onEnded?.();
            }
          },
          onError: (event) => callbacksRef.current.onError?.(`IFrame Player ${event.data}`),
        },
      });
    }).catch((error) => callbacksRef.current.onError?.(error.message));

    return () => {
      disposed = true;
      stopProgress();
      onController(null);
      try { player?.stopVideo(); } catch { /* Player già chiuso. */ }
      try { player?.destroy(); } catch { /* IFrame già rimosso. */ }
    };
  }, [onController, playbackIntentRef, videoId]);

  return (
    <div className="essentials-youtube-media" aria-label="Player YouTube ufficiale">
      <div ref={hostRef} />
    </div>
  );
}

export default YouTubeEssentialsMedia;
