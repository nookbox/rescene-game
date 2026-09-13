import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PLAYER, TILE_SIZE } from '@/utils/constants';

// 한 칸 뛰는 데 걸리는 시간(초)과 포물선 최고 높이
const JUMP_DURATION = 0.2;
const JUMP_HEIGHT = 0.5;

// 방향 전환 속도. 클수록 빨리 돈다
const TURN_SPEED = 12;

type PlayerProps = {
  tileX: number;
  tileZ: number;
  facing: number;
  color?: string;
};

export function Player({
  color = 'white',
  tileX,
  tileZ,
  facing,
}: PlayerProps) {
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

  useFrame((_state, delta) => {
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

    // 목표 각도까지의 차이를 -π ~ π 로 접는다.
    // 이걸 안 하면 π 에서 -π/2 로 갈 때 270도를 빙 돌아간다.
    const current = jumpRef.current.rotation.y;
    let diff = facing - current;
    diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;

    // delta 기반이라 모니터 주사율이 달라도 도는 속도가 같다
    jumpRef.current.rotation.y =
      current + diff * (1 - Math.exp(-TURN_SPEED * delta));
  });

  return (
    // group은 여러 mesh를 묶는 용도고 div와 비슷하다.
    <group ref={moveRef}>
      {/* 안쪽 group이 점프 높이(y)와 바라보는 방향(rotation.y)을 담당 */}
      <group ref={jumpRef}>
        {/* mesh는 중심이 원점이라, 높이 절반만큼 올려야 발이 바닥에 닿는다.
          이 계산을 여기서 끝내두면 바깥은 y를 신경 쓸 필요가 없다. */}
        <mesh position={[0, PLAYER.height / 2, 0]}>
          <boxGeometry args={[PLAYER.width, PLAYER.height, PLAYER.depth]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* 임시: 상자라 회전이 안 보여서 붙인 "코".
            모델을 넣으면 지울 것 */}
        <mesh position={[0, PLAYER.height * 0.7, -PLAYER.depth / 2]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color='white' />
        </mesh>
      </group>
    </group>
  );
}
