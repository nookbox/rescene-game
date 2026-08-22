import { useEffect, useRef } from "react";
import Game from "../game/Game.js";

/**
 * React와 three.js를 이어주는 다리.
 *
 * 이 컴포넌트가 하는 일은 딱 하나: Game을 "붙였다 떼는" 것.
 * 게임 로직은 절대 여기 쓰지 말 것. 전부 src/game/ 안으로.
 */
export default function GameCanvas({ onCollect, onGameOver }) {
  const canvasRef = useRef(null);

  // 콜백을 ref에 담아두는 이유:
  // 부모가 리렌더될 때마다 onCollect 함수가 새로 만들어지는데,
  // 그걸 useEffect 의존성에 넣으면 게임이 통째로 재시작된다.
  // ref에 최신 값만 갈아끼우면 게임은 한 번만 만들어진다.
  const callbacks = useRef({ onCollect, onGameOver });
  callbacks.current = { onCollect, onGameOver };

  useEffect(() => {
    const game = new Game(canvasRef.current, {
      onCollect: (payload) => callbacks.current.onCollect?.(payload),
      onGameOver: (payload) => callbacks.current.onGameOver?.(payload),
    });
    game.start();

    // 이 return이 없으면 StrictMode에서 게임이 2개 돌아간다. 절대 지우지 말 것.
    return () => game.dispose();
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}
