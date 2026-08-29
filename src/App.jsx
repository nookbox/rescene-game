import { useState } from 'react';
import GameCanvas from './components/game-canvas.jsx';

export default function App() {
  const [score, setScore] = useState(0);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GameCanvas onCollect={({ score }) => setScore(score)} />

      <div className='absolute top-0 left-0'>Score: {score}</div>
    </div>
  );
}
