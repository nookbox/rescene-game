import { useState } from 'react';
import GameCanvas from './components/game-canvas.js';
import { GameState } from './game/types.js';
import { GameOver } from './components/game-over.js';

export default function App() {
  const [state, setState] = useState<GameState>({ score: 0, life: 3 });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GameCanvas onChange={({ score, life }) => setState({ score, life })} />

      <div className='absolute top-0 left-0'>Score: {state.score}</div>
      <div className='absolute top-5 left-0'>Life: {state.life}</div>

      {state.life <= 0 && <GameOver score={state.score} />}
    </div>
  );
}
