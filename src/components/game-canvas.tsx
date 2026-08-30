import { useEffect, useRef } from 'react';
import Game from '../game/game.ts';
import type { GameOptions } from '../game/types.ts';

export default function GameCanvas({ onChange, onGameOver }: GameOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const callbacks = useRef({ onChange, onGameOver });
  callbacks.current = { onChange, onGameOver };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = new Game(canvas, {
      onChange: (payload) => callbacks.current.onChange?.(payload),
      onGameOver: (payload) => callbacks.current.onGameOver?.(payload),
    });
    game.start();

    return () => game.dispose();
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
