import { useEffect, useRef } from 'react';
import Game from '../game/game.ts';

export default function GameCanvas({ onCollect, onGameOver }) {
  const canvasRef = useRef(null);

  const callbacks = useRef({ onCollect, onGameOver });
  callbacks.current = { onCollect, onGameOver };

  useEffect(() => {
    const game = new Game(canvasRef.current, {
      onCollect: (payload) => callbacks.current.onCollect?.(payload),
      onGameOver: (payload) => callbacks.current.onGameOver?.(payload),
    });
    game.start();

    return () => game.dispose();
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
