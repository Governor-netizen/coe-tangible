import { useAnimatedCursor } from "./assets/cursors/link-select/useAnimatedCursor";

export default function App() {
  useAnimatedCursor("body", 100);

  return (
    <main style={{ padding: 40 }}>
      <h1>Animated cursor test</h1>
      <button>Hover / click test</button>
    </main>
  );
}
