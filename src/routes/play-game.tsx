import { CameraController } from '@/components/game/camera-controller';
import { Car } from '@/components/game/car';
import { Lane } from '@/components/game/lane';
import { Player } from '@/components/game/player';
import { Button } from '@/components/ui/button';
import { CAMERA, FACING, LANE, LIGHT, TILE_SIZE } from '@/utils/constants';
import {
  createLaneStream,
  type Lane as LaneData,
  type LaneStream,
} from '@/utils/lanes';
import { Canvas } from '@react-three/fiber';
import { createFileRoute } from '@tanstack/react-router';
import { Fragment, useEffect, useState, useRef } from 'react';

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
  // 어느 방향으로 튕겨나갈지. 죽을 때 딱 한 번 정해진다.
  const [hitSpeed, setHitSpeed] = useState(0);
  const [runId, setRunId] = useState(0);

  // 레인 생성기는 리렌더와 무관하게 살아있어야 해서 ref에 담는다.
  // ref 객체 자체는 절대 안 바뀌므로 핸들러 안에서 읽어도 오래된 값이 잡히지 않는다.
  const streamRef = useRef<LaneStream | null>(null);
  streamRef.current ??= createLaneStream();

  const [lanes, setLanes] = useState<LaneData[]>(() =>
    streamRef.current!.ensure(LANE.ahead),
  );

  // 플레이어가 실제로 그려지는 위치. 충돌 판정이 이걸 본다.
  // 매 프레임 바뀌므로 state가 아니라 ref로 공유한다.
  const playerPos = useRef({ x: 0, z: 0 });

  const [best, setBest] = useState(readBestScore);
  const [isNewBest, setIsNewBest] = useState(false);

  // 점수 = 가장 멀리 간 칸 수. tile과 같이 움직이므로 한 덩어리로 둔다.
  // 따로 두고 effect로 맞추면 렌더가 한 번 더 도는 데다 순서도 어긋난다.
  const score = tile.score;

  // 앞쪽이 모자라기 전에 미리 이어붙인다
  useEffect(() => {
    const stream = streamRef.current!;
    if (stream.length <= tile.z + LANE.ahead) {
      setLanes(stream.ensure(tile.z + LANE.ahead));
    }
  }, [tile.z]);

  // 죽는 순간에만 최고 점수를 갱신한다
  const handleHit = (carSpeed: number) => {
    setIsGameOver(true);
    setHitSpeed(carSpeed);

    if (score > best) {
      setBest(score);
      setIsNewBest(true);
      writeBestScore(score);
    }
  };

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
            if (prev.z >= streamRef.current!.length - 1)
              return { ...prev, facing: FACING.up };

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

  // slice/filter로 자르면 map의 인덱스가 0부터 다시 시작해 맵이 앞으로 당겨진다.
  // 원래 번호를 그대로 들고 돌아야 한다.
  const visible: number[] = [];
  for (
    let i = Math.max(0, tile.z - LANE.behind);
    i <= Math.min(lanes.length - 1, tile.z + LANE.ahead);
    i++
  ) {
    visible.push(i);
  }

  return (
    <div className='relative w-full h-full'>
      <Canvas
        camera={{ position: [0, CAMERA.height, CAMERA.distance] }}
        dpr={[1, 2]}
        key={runId}
      >
        <CameraController tileZ={tile.z} />
        <Player
          // position={[tile.x * TILE_SIZE, 0, -tile.z * TILE_SIZE]}
          tileX={tile.x}
          tileZ={tile.z}
          facing={tile.facing}
          posRef={playerPos}
          dead={isGameOver}
          hitSpeed={hitSpeed}
        />

        {/* 색을 날리지 않을 만큼만 밝힌다.
            spotLight는 원뿔이라 화면 끝이 어두워졌다.
            directionalLight는 태양처럼 평행광이라 넓은 맵에 고르게 닿는다. */}
        <ambientLight intensity={LIGHT.ambient} />
        <directionalLight position={[6, 12, 6]} intensity={LIGHT.sun} />

        {visible.map((index) => {
          const lane = lanes[index];
          return (
          <Fragment key={index}>
            <Lane
              position={[0, 0, -index * TILE_SIZE]}
              index={index}
              variant={
                lane.type === 'road' && lane.crosswalk ? 'crosswalk' : lane.type
              }
            />

            {lane.type === 'road' &&
              lane?.cars?.map((startX, carIndex) => (
                <Car
                  key={carIndex}
                  model={lane.model}
                  position={[startX, 0, -index * TILE_SIZE]}
                  speed={lane.speed}
                  playerPos={playerPos}
                  laneIndex={index}
                  onHit={handleHit}
                />
              ))}
          </Fragment>
          );
        })}
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
              streamRef.current = createLaneStream();
              setLanes(streamRef.current.ensure(LANE.ahead));
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
