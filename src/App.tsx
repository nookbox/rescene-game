import { useState } from 'react';
import GameCanvas from './components/game-canvas.js';
import { GameState } from './game/types.js';
import { GameOverScene } from './components/scenes/game-over-scene.js';

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

      <div className='absolute top-0 left-0'>Score: {state.score}</div>
      <div className='absolute top-5 left-0'>Life: {state.life}</div>

      {/* TODO: HERO 페이지 */}

      {scene === 'gameover' && (
        <GameOverScene score={state.score} onRetry={handleRetry} />
      )}
    </div>
  );
}
