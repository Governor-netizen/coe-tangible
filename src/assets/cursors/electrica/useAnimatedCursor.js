import { useEffect } from "react";

// .cur frame files from this folder, imported with ?url for Vite
import frame0 from "./electrica-0.cur?url";
import frame1 from "./electrica-1.cur?url";
import frame2 from "./electrica-2.cur?url";
import frame3 from "./electrica-3.cur?url";

const frames = [frame0, frame1, frame2, frame3];

/**
 * Animates the cursor globally as the default cursor by cycling .cur frames
 * via an injected <style> tag.
 *
 * @param {number} speed  ms per frame (default 117)
 */
export function useAnimatedCursor(speed = 117) {
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-electrica-cursor", "");
    document.head.appendChild(style);

    let i = 0;

    const tick = () => {
      style.textContent = `
*, *::before, *::after, html, body {
  cursor: url(${frames[i]}) 0 0, auto !important;
}
`;
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
