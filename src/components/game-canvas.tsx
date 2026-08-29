import { useEffect, useRef } from 'react';
import Game from '../game/game.ts';

interface Props {
  onCollect?: (payload: { score: number }) => void;
  onGameOver: any; // 정의하기
}

export default function GameCanvas({ onCollect, onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const callbacks = useRef({ onCollect, onGameOver });
  callbacks.current = { onCollect, onGameOver };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = new Game(canvas, {
      onCollect: (payload) => callbacks.current.onCollect?.(payload),
      onGameOver: (payload) => callbacks.current.onGameOver?.(payload),
    });
    game.start();

    return () => game.dispose();
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
