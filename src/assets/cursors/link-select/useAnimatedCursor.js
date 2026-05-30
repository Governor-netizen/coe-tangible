import { useEffect } from "react";

// .cur frame files from this folder
import frame0 from "./link-select-0.cur?url";
import frame1 from "./link-select-1.cur?url";
import frame2 from "./link-select-2.cur?url";
import frame3 from "./link-select-3.cur?url";
import frame4 from "./link-select-4.cur?url";

const frames = [frame0, frame1, frame2, frame3, frame4];

// All interactive / clickable elements that should show the animated cursor
const INTERACTIVE_SELECTORS = [
  "a",
  "button",
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  "label",
  "select",
  "summary",
  '[tabindex]:not([tabindex="-1"])',
  'input[type="submit"]',
  'input[type="reset"]',
  'input[type="button"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'input[type="range"]',
  'input[type="file"]',
  ".cursor-pointer",
].join(",\n");

/**
 * Animates the cursor on interactive elements by cycling .cur frames
 * via an injected <style> tag. Non-interactive elements keep their
 * default cursor (electrica.ani set in CSS).
 *
 * @param {number} speed  ms per frame (default 100)
 */
export function useAnimatedCursor(speed = 100) {
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-animated-cursor", "");
    document.head.appendChild(style);

    let i = 0;

    const tick = () => {
      style.textContent = `${INTERACTIVE_SELECTORS} {
  cursor: url(${frames[i]}) 0 0, pointer !important;
}`;
      i = (i + 1) % frames.length;
    };

    tick(); // render the first frame immediately
    const interval = setInterval(tick, speed);

    return () => {
      clearInterval(interval);
      style.remove();
    };
  }, [speed]);
}
