import { CAR, LANE, PLAYER, TILE_SIZE } from '@/utils/constants';
import { ThreeElements, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type CarProps = ThreeElements['group'] & {
  speed?: number;
  onHit: () => void;
  playerTileX: number;
  playerTileZ: number;
  laneIndex: number;
};

// 두 상자의 중심이 이보다 가까우면 겹친 것.
// 각자 반폭을 더한 값이 "닿기 시작하는 거리"다.
const HIT_DISTANCE = CAR.width / 2 + PLAYER.width / 2;

export function Car({
  speed = 2,
  playerTileX,
  playerTileZ,
  laneIndex,
  onHit,
  ...props
}: CarProps) {
  const carRef = useRef<THREE.Group>(null);

  const alreadyNotifiedRef = useRef(false);

  useFrame((_state, delta) => {
    if (!carRef.current) return;
    const car = carRef.current;

    car.position.x += speed * delta;

    // 오른쪽으로 가는 차는 오른쪽 끝을 넘으면 왼쪽에서 다시 들어온다
    if (speed > 0 && car.position.x > LANE.wrap) {
      car.position.x = -LANE.wrap;
    }

    // 왼쪽으로 가는 차(speed가 음수)는 반대.
    // 이 검사가 없으면 음수 속도일 때 왼쪽으로 무한히 가버린다.
    if (speed < 0 && car.position.x < -LANE.wrap) {
      car.position.x = LANE.wrap;
    }

    // 같은 레인인가
    if (laneIndex !== playerTileZ) return;

    // x가 겹치는가 — 중심 사이 거리로 판정
    const playerX = playerTileX * TILE_SIZE;
    const gap = Math.abs(car.position.x - playerX);

    if (gap < HIT_DISTANCE) {
      if (!alreadyNotifiedRef.current) {
        onHit();
        alreadyNotifiedRef.current = true;
      }
    } else {
      alreadyNotifiedRef.current = false;
    }
  });

  return (
    <group ref={carRef} {...props}>
      <mesh position={[0, CAR.height / 2, 0]}>
        <boxGeometry args={[CAR.width, CAR.height, CAR.depth]} />
        <meshStandardMaterial color='red' />
      </mesh>
    </group>
  );
}
