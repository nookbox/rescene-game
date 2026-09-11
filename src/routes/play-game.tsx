import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { createFileRoute } from '@tanstack/react-router';
import { useControls } from 'leva';
import { Lane } from '@/components/game/lane';
import { lanes } from '@/utils/lanes';
import { Player } from '@/components/game/player';
import { TILE_SIZE, LANE } from '@/utils/constants';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/play-game')({
  component: PlayGame,
});

function PlayGame() {
  const [tile, setTile] = useState({ x: 0, z: 0 });

  const { ambient, spot } = useControls('조명', {
    ambient: { value: 1.5, min: 0, max: 5, step: 0.1 },
    spot: { value: 3, min: 0, max: 10, step: 0.1 },
  });

  useEffect(() => {
    // 좌우 한계. width가 11이면 -5 ~ 5
    const limit = Math.floor(LANE.width / 2);

    const handleKeyDown = (e: KeyboardEvent) => {
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
        switch (e.key) {
          case 'ArrowUp':
            // 마지막 타일보다 앞으로는 못간다
            return prev.z < lanes.length - 1
              ? { ...prev, z: prev.z + 1 }
              : prev;

          case 'ArrowDown':
            // 출발선보다 뒤로는 못 간다
            return prev.z > 0 ? { ...prev, z: prev.z - 1 } : prev;
          case 'ArrowLeft':
            return prev.x > -limit ? { ...prev, x: prev.x - 1 } : prev;
          case 'ArrowRight':
            return prev.x < limit ? { ...prev, x: prev.x + 1 } : prev;
          default:
            return prev;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Canvas camera={{ position: [0, 3, 6] }}>
      <Player
        // position={[tile.x * TILE_SIZE, 0, -tile.z * TILE_SIZE]}
        tileX={tile.x}
        tileZ={tile.z}
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
        <Lane
          key={index}
          position={[0, 0, -index * TILE_SIZE]}
          rotation={[-Math.PI / 2, 0, 0]}
          width={LANE.width}
          depth={TILE_SIZE}
          color={lane.type === 'grass' ? 'green' : 'gray'}
        />
      ))}

      {/* 개발용: 마우스로 카메라를 돌려본다. 완성되면 지울 것 */}
      <OrbitControls />
    </Canvas>
  );
}
