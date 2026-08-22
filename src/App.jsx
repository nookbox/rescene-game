import GameCanvas from "./components/GameCanvas.jsx";

export default function App() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <GameCanvas />

      {/* HUD(점수판 등)는 캔버스 위에 절대위치로 올린다.
          pointerEvents: "none" 을 줘야 마우스 클릭이 캔버스로 통과한다. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          padding: 20,
        }}
      >
        <p style={{ opacity: 0.5, fontSize: 14 }}>
          시작 지점 → <code>src/game/Game.js</code>
        </p>
      </div>
    </div>
  );
}
