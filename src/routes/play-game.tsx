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
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      console.log(`Key: ${e.key}, Code: ${e.code}`);

      if (e.key === 'ArrowUp') {
        setTile((prev) => ({ ...prev, z: prev.z - 1 }));
      }
      if (e.key === 'ArrowDown') {
        setTile((prev) => ({ ...prev, z: prev.z + 1 }));
      }
      if (e.key === 'ArrowLeft' && tile.x > -Math.floor(LANE.width / 2)) {
        setTile((prev) => ({ ...prev, x: prev.x - 1 }));
      }
      if (e.key === 'ArrowRight' && tile.x < Math.floor(LANE.width / 2)) {
        setTile((prev) => ({ ...prev, x: prev.x + 1 }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Canvas camera={{ position: [0, 3, 6] }}>
      <Player
        position={[tile.x * TILE_SIZE, 0, tile.z * TILE_SIZE]}
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
