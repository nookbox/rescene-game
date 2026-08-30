import { useEffect, useState } from 'react';

interface Props {
  score: number;
  onRetry: () => void;
}

const CHOICES = ['YES', 'NO'] as const;

export function GameOverScene({ score, onRetry }: Props) {
  // 0 = YES, 1 = NO. 방향키로 옮기고 Enter로 확정
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') setSelected(0);
      if (e.code === 'ArrowRight') setSelected(1);
      if (e.code === 'Enter' || e.code === 'Space') {
        if (selected === 0) onRetry();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected, onRetry]);

  return (
    <div className='retro-scanlines absolute inset-0 flex flex-col items-center justify-center gap-8 bg-black/85 font-retro text-cyan-200'>
      <h1 className='retro-glow text-4xl tracking-widest sm:text-6xl'>
        GAME OVER
      </h1>

      <p className='retro-glow text-[10px] tracking-[0.3em] sm:text-sm'>
        SCORE {String(score).padStart(4, '0')}
      </p>

      <p className='text-[8px] tracking-[0.2em] text-cyan-400/80 sm:text-xs'>
        DO YOU WANT TO CONTINUE?
      </p>

      <div className='flex gap-10 text-xs sm:text-base'>
        {CHOICES.map((choice, i) => (
          <button
            key={choice}
            onClick={() => i === 0 && onRetry()}
            onMouseEnter={() => setSelected(i)}
            className={
              selected === i
                ? 'retro-glow cursor-pointer text-cyan-100'
                : 'cursor-pointer text-cyan-500/50 hover:text-cyan-300'
            }
          >
            <span className={selected === i ? 'retro-blink' : 'invisible'}>
              {'▶'}
            </span>{' '}
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
