import { CameraController } from '@/components/game/camera-controller';
import { Car } from '@/components/game/car';
import { Lane } from '@/components/game/lane';
import { Player } from '@/components/game/player';
import { Button } from '@/components/ui/button';
import { CAMERA, FACING, LANE, TILE_SIZE } from '@/utils/constants';
import { lanes } from '@/utils/lanes';
import { Canvas } from '@react-three/fiber';
import { createFileRoute } from '@tanstack/react-router';
import { useControls } from 'leva';
import { Fragment, useEffect, useState } from 'react';

export const Route = createFileRoute('/play-game')({
  component: PlayGame,
});

const BEST_SCORE_KEY = 'rescene-best-score';

// 사생활 보호 모드 등에서 localStorage 접근 자체가 막히는 브라우저가 있다.
function readBestScore() {
  try {
    return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeBestScore(value: number) {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(value));
  } catch {
    // 저장 못 해도 게임은 굴러가야 한다
  }
}

function PlayGame() {
  // facing = 바라보는 방향의 Y축 회전각(라디안). -Z가 앞이므로 0이 전방.
  const [tile, setTile] = useState({ x: 0, z: 0, facing: 0, score: 0 });

  const [isGameOver, setIsGameOver] = useState(false);
  const [runId, setRunId] = useState(0);

  const [best, setBest] = useState(readBestScore);
  const [isNewBest, setIsNewBest] = useState(false);

  // 점수 = 가장 멀리 간 칸 수. tile과 같이 움직이므로 한 덩어리로 둔다.
  // 따로 두고 effect로 맞추면 렌더가 한 번 더 도는 데다 순서도 어긋난다.
  const score = tile.score;

  // 죽는 순간에만 최고 점수를 갱신한다
  const handleHit = () => {
    setIsGameOver(true);

    if (score > best) {
      setBest(score);
      setIsNewBest(true);
      writeBestScore(score);
    }
  };

  const { ambient, spot } = useControls('조명', {
    ambient: { value: 1.5, min: 0, max: 5, step: 0.1 },
    spot: { value: 3, min: 0, max: 10, step: 0.1 },
  });

  useEffect(() => {
    // 좌우 한계. width가 11이면 -5 ~ 5
    const limit = Math.floor(LANE.width / 2);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;

      const isArrow =
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight';

      if (!isArrow) return;

      // 방향키는 페이지를 위아래로 스크롤시키므로 막음
      e.preventDefault();

      // 경계 검사를 업데이터 안에서 prev로 한다.
      // 바깥의 tile을 읽지 않으므로 의존성 배열을 비워둘 수 있다.
      setTile((prev) => {
        // 막혀서 못 움직이더라도 방향은 바꾼다.
        // 벽에 붙어서 좌를 누르면 제자리에서 좌를 바라보게 된다.
        switch (e.key) {
          case 'ArrowUp': {
            // 마지막 타일보다 앞으로는 못간다
            if (prev.z >= lanes.length - 1) return { ...prev, facing: FACING.up };

            const z = prev.z + 1;

            // 뒤로 물러났다 와도 점수가 깎이지 않게 최댓값만 남긴다
            return {
              ...prev,
              z,
              facing: FACING.up,
              score: Math.max(prev.score, z),
            };
          }

          case 'ArrowDown':
            // 출발선보다 뒤로는 못 간다
            return prev.z > 0
              ? { ...prev, z: prev.z - 1, facing: FACING.down }
              : { ...prev, facing: FACING.down };
          case 'ArrowLeft':
            return prev.x > -limit
              ? { ...prev, x: prev.x - 1, facing: FACING.left }
              : { ...prev, facing: FACING.left };
          case 'ArrowRight':
            return prev.x < limit
              ? { ...prev, x: prev.x + 1, facing: FACING.right }
              : { ...prev, facing: FACING.right };
          default:
            return prev;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGameOver]);

  return (
    <div className='relative w-full h-full'>
      <Canvas
        camera={{ position: [0, CAMERA.height, CAMERA.distance] }}
        key={runId}
      >
        <CameraController tileZ={tile.z} />
        <Player
          // position={[tile.x * TILE_SIZE, 0, -tile.z * TILE_SIZE]}
          tileX={tile.x}
          tileZ={tile.z}
          facing={tile.facing}
        />

        <ambientLight intensity={ambient} />
        <spotLight
          position={[10, 10, 10]}
          penumbra={1}
          decay={0}
          intensity={spot}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

        {lanes.map((lane, index) => (
          <Fragment key={index}>
            <Lane
              position={[0, 0, -index * TILE_SIZE]}
              rotation={[-Math.PI / 2, 0, 0]}
              width={LANE.width}
              depth={TILE_SIZE}
              color={lane.type === 'safe' ? 'green' : 'gray'}
            />

            {lane.type === 'road' &&
              lane?.cars?.map((startX, carIndex) => (
                <Car
                  key={carIndex}
                  model={lane.model}
                  position={[startX, 0, -index * TILE_SIZE]}
                  speed={lane.speed}
                  playerTileX={tile.x}
                  playerTileZ={tile.z}
                  laneIndex={index}
                  onHit={handleHit}
                />
              ))}
          </Fragment>
        ))}
      </Canvas>
      {/* 플레이 중 점수. 캔버스 위에 얹는다 */}
      <div className='pointer-events-none absolute top-6 left-6 text-white drop-shadow'>
        <p className='text-5xl font-bold tabular-nums'>{score}</p>
        <p className='text-sm text-white/70 tabular-nums'>BEST {best}</p>
      </div>

      {isGameOver && (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/70'>
          <p className='text-4xl font-bold text-red-600'>Game Over</p>

          <div className='text-center text-white'>
            <p className='text-7xl font-bold tabular-nums'>{score}</p>
            <p className='mt-1 text-sm text-white/70 tabular-nums'>
              BEST {best}
            </p>
          </div>

          {isNewBest && (
            <p className='rounded-full bg-amber-400 px-4 py-1 text-sm font-bold text-amber-950'>
              NEW BEST!
            </p>
          )}

          <Button
            onClick={() => {
              setRunId((prev) => prev + 1);
              setIsGameOver(false);
              setTile({ x: 0, z: 0, facing: 0, score: 0 });
              setIsNewBest(false);
            }}
          >
            다시하기
          </Button>
        </div>
      )}
    </div>
  );
}
