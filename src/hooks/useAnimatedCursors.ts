import { useAnimatedCursor as useLinkSelectCursor } from "../assets/cursors/link-select/useAnimatedCursor";
import { useAnimatedCursor as useElectricaCursor } from "../assets/cursors/electrica/useAnimatedCursor";

export function useAnimatedCursors() {
  // Run both hooks:
  // - Electrica animates the default cursor on `*, html, body` at 117ms per frame
  // - Link-Select animates the pointer cursor on interactive elements at 100ms per frame
  useElectricaCursor(117);
  useLinkSelectCursor(100);
}
