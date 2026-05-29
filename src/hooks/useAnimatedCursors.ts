import { useEffect } from 'react';
import { convertAniBinaryToCSS } from 'ani-cursor';

export function useAnimatedCursors() {
  useEffect(() => {
    async function initCursors() {
      try {
        // Fetch electrica.ani (Default cursor)
        const resDefault = await fetch('/electrica.ani');
        if (!resDefault.ok) throw new Error('Failed to load electrica.ani');
        const defaultData = new Uint8Array(await resDefault.arrayBuffer());

        // Fetch link-select.ani (Pointer cursor)
        const resPointer = await fetch('/link-select.ani');
        if (!resPointer.ok) throw new Error('Failed to load link-select.ani');
        const pointerData = new Uint8Array(await resPointer.arrayBuffer());

        const style = document.createElement('style');

        // Apply default cursor broadly
        const defaultSelector = `body, body *`;
        const defaultCSS = convertAniBinaryToCSS(defaultSelector, defaultData);

        // Apply Link Select cursor to interactive elements. 
        // Prefixing with 'body ' increases specificity over Tailwind's base styles.
        const pointerSelector = `
          body a, body a *, 
          body button, body button *, 
          body [role="button"], body [role="button"] *,
          body [role="link"], body [role="tab"],
          body [role="menuitem"], body [role="option"], body [role="checkbox"],
          body [role="radio"], body [role="switch"], body label, body select, body summary,
          body input[type="submit"], body input[type="reset"], body input[type="button"],
          body input[type="checkbox"], body input[type="radio"], body input[type="range"],
          body input[type="file"], 
          body .cursor-pointer, body .cursor-pointer *
        `;
        const pointerCSS = convertAniBinaryToCSS(pointerSelector, pointerData);

        style.innerHTML = `
          /* Base cursors */
          ${defaultCSS}
          
          /* Pointer cursors override base */
          ${pointerCSS}
          
          /* Keep text cursor for text inputs / textareas */
          input:not([type="submit"]):not([type="reset"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]),
          textarea,
          [contenteditable="true"],
          .cursor-text {
            cursor: text !important;
            animation: none !important;
          }
          
          /* Disabled elements keep not-allowed */
          [disabled],
          .disabled,
          .cursor-not-allowed {
            cursor: not-allowed !important;
            animation: none !important;
          }
        `;
        document.head.appendChild(style);
      } catch (err) {
        console.error('Failed to load animated cursors:', err);
      }
    }

    initCursors();
  }, []);
}
