import { useEffect, useRef } from "react";

import { EDGE_SWIPE_START_PX, isEdgeSwipeBack } from "../lib/edgeSwipeBack.js";

const interactiveSelector = "a, button, input, select, textarea, audio, video, [role='button'], [role='slider'], [contenteditable='true']";

const belongsToHorizontalScroller = (target) => {
  let element = target instanceof Element ? target : null;
  while (element && element !== document.documentElement) {
    const style = window.getComputedStyle(element);
    if ((style.overflowX === "auto" || style.overflowX === "scroll") && element.scrollWidth > element.clientWidth) return true;
    element = element.parentElement;
  }
  return false;
};

export default function GlobalSwipeBack({ enabled, onBack }) {
  const gestureRef = useRef(null);

  useEffect(() => {
    const reset = () => {
      gestureRef.current = null;
    };
    const handleTouchStart = (event) => {
      if (!enabled || event.touches.length !== 1) return reset();
      const touch = event.touches[0];
      const target = event.target;
      if (touch.clientX > EDGE_SWIPE_START_PX || target.closest?.(interactiveSelector) || belongsToHorizontalScroller(target)) return reset();
      gestureRef.current = { startX: touch.clientX, startY: touch.clientY, endX: touch.clientX, endY: touch.clientY };
    };
    const handleTouchMove = (event) => {
      const gesture = gestureRef.current;
      if (!gesture || event.touches.length !== 1) return reset();
      const touch = event.touches[0];
      gesture.endX = touch.clientX;
      gesture.endY = touch.clientY;
      if (Math.abs(gesture.endY - gesture.startY) > Math.max(20, gesture.endX - gesture.startX)) reset();
    };
    const handleTouchEnd = () => {
      const gesture = gestureRef.current;
      reset();
      if (gesture && isEdgeSwipeBack(gesture)) onBack();
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", reset, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", reset);
    };
  }, [enabled, onBack]);

  return null;
}
