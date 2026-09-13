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

function PlayGame() {
  // facing = 바라보는 방향의 Y축 회전각(라디안). -Z가 앞이므로 0이 전방.
  const [tile, setTile] = useState({ x: 0, z: 0, facing: 0 });

  const [isGameOver, setIsGameOver] = useState(false);
  const [runId, setRunId] = useState(0);

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
          case 'ArrowUp':
            // 마지막 타일보다 앞으로는 못간다
            return prev.z < lanes.length - 1
              ? { ...prev, z: prev.z + 1, facing: FACING.up }
              : { ...prev, facing: FACING.up };

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
          color='red'
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
                  position={[startX, 0, -index * TILE_SIZE]}
                  speed={lane.speed}
                  playerTileX={tile.x}
                  playerTileZ={tile.z}
                  laneIndex={index}
                  onHit={() => setIsGameOver(true)}
                />
              ))}
          </Fragment>
        ))}
      </Canvas>
      {isGameOver && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/70 text-4xl font-bold text-red-600'>
          Game Over
          <Button
            onClick={() => {
              setRunId((prev) => prev + 1);
              setIsGameOver(false);
              setTile({ x: 0, z: 0, facing: 0 });
            }}
          >
            다시하기
          </Button>
        </div>
      )}
    </div>
  );
}
