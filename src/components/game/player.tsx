import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TILE_SIZE } from '@/utils/constants';

// 캐릭터 상자 치수 (가로, 높이, 깊이)
const WIDTH = 0.7;
const HEIGHT = 1.5;
const DEPTH = 0.7;

// 한 칸 뛰는 데 걸리는 시간(초)과 포물선 최고 높이
const JUMP_DURATION = 0.2;
const JUMP_HEIGHT = 0.5;

type PlayerProps = {
  tileX: number;
  tileZ: number;
  color?: string;
};

export function Player({ color = 'white', tileX, tileZ }: PlayerProps) {
  const moveRef = useRef<THREE.Group>(null);
  const jumpRef = useRef<THREE.Group>(null);

  const startTime = useRef(0); // 이번 점프가 시작된 시각
  const from = useRef({ x: 0, z: 0 }); // 점프 출발 위치(실제 좌표)

  useEffect(() => {
    startTime.current = performance.now() / 1000;

    // 출발점은 이전 칸이 아니라 지금 실제로 서 있는 위치.
    // 점프 도중에 끊겨도 그 자리에서 자연스럽게 이어진다.
    if (moveRef.current) {
      from.current = {
        x: moveRef.current.position.x,
        z: moveRef.current.position.z,
      };
    }
  }, [tileX, tileZ]);

  useFrame(() => {
    if (!moveRef.current || !jumpRef.current) return;

    const targetX = tileX * TILE_SIZE;
    const targetZ = -tileZ * TILE_SIZE;

    // 0 → 1 로 가는 진행도
    const elapsed = performance.now() / 1000 - startTime.current;
    const progress = Math.min(elapsed / JUMP_DURATION, 1);

    // 선형 보간: 출발 + (목표 - 출발) × 진행도
    moveRef.current.position.x =
      from.current.x + (targetX - from.current.x) * progress;
    moveRef.current.position.z =
      from.current.z + (targetZ - from.current.z) * progress;

    //  시작·끝이 바닥인 포물선
    jumpRef.current.position.y = Math.sin(progress * Math.PI) * JUMP_HEIGHT;
  });

  return (
    // group은 여러 mesh를 묶는 용도고 div와 비슷하다.
    <group ref={moveRef}>
      <group ref={jumpRef}>
        {/* mesh는 중심이 원점이라, 높이 절반만큼 올려야 발이 바닥에 닿는다.
          이 계산을 여기서 끝내두면 바깥은 y를 신경 쓸 필요가 없다. */}
        <mesh position={[0, HEIGHT / 2, 0]}>
          <boxGeometry args={[WIDTH, HEIGHT, DEPTH]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
}
