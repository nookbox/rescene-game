import { useState } from 'react';
import GameCanvas from './components/game-canvas.js';
import { GameState } from './game/types.js';
import { GameOverScene } from './components/scenes/game-over-scene.js';
import { LIFE } from './game/constants.js';

type SceneName = 'hero' | 'playing' | 'gameover';

export default function App() {
  const [scene, setScene] = useState<SceneName>('hero');

  const [state, setState] = useState<GameState>({ score: 0, life: 3 });
  const [runId, setRunId] = useState(0);

  const handleRetry = () => {
    setState({ score: 0, life: 3 });
    setRunId((n) => n + 1);
    setScene('playing');
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GameCanvas
        onChange={({ score, life }) => setState({ score, life })}
        onGameOver={() => setScene('gameover')}
        key={runId}
      />

      <div className='absolute top-3 left-3 flex flex-col gap-2'>
        <div>Score: {state.score}</div>

        <div className='flex gap-1'>
          {Array.from({ length: LIFE }, (_, i) => (
            <img
              key={i}
              src={
                i < state.life
                  ? '/sprites/ui/heart-full.png'
                  : '/sprites/ui/heart-empty.png'
              }
              alt=''
              width={28}
              height={28}
              style={{ imageRendering: 'pixelated' }}
            />
          ))}
        </div>
      </div>

      {/* TODO: HERO 페이지 */}

      {scene === 'gameover' && (
        <GameOverScene score={state.score} onRetry={handleRetry} />
      )}
    </div>
  );
}
