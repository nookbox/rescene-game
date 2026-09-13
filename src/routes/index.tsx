import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Landing,
});

function Landing() {
  const startRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    startRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.code === 'ArrowDown') {
        startRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className='retro-scanlines flex h-full w-full flex-col items-center justify-center gap-10 bg-black font-retro text-cyan-200'>
      <h1 className='retro-glow text-3xl tracking-widest sm:text-5xl'>
        CROSSY
      </h1>

      <p className='text-[8px] tracking-[0.3em] text-cyan-400/80 sm:text-xs'>
        차를 피해 길을 건너세요
      </p>

      <Button
        asChild
        variant='link'
        className='retro-glow retro-blink text-xs tracking-[0.2em] text-cyan-100 sm:text-base'
      >
        <Link to='/play-game' ref={startRef}>
          ▶ PRESS START
        </Link>
      </Button>
    </div>
  );
}
