import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PLAYER, TILE_SIZE } from '@/utils/constants';

const MODEL_URL = '/models/character-male-a.glb';

// 모델 원본 높이는 0.67. PLAYER.height에 맞춰 키운다.
const MODEL_SCALE = PLAYER.height / 0.6713;

// Kenney 캐릭터는 +Z를 보고 서 있다. 우리 약속은 -Z가 앞이라 반 바퀴 돌린다.
const MODEL_FACING_FIX = Math.PI;

// 한 칸 뛰는 데 걸리는 시간(초)과 포물선 최고 높이
const JUMP_DURATION = 0.2;
const JUMP_HEIGHT = 0.5;

// 방향 전환 속도. 클수록 빨리 돈다
const TURN_SPEED = 12;

// 차에 치였을 때 날아가는 정도
const KNOCK_SIDE = 6; // 치인 방향으로 밀리는 속도
const KNOCK_UP = 6; // 위로 솟는 속도
const GRAVITY = 20; // 초당 y속도가 깎이는 양
const SPIN = 8; // 공중에서 도는 속도(라디안/초)

// 이보다 아래로 떨어지면 그만 계산한다
const FLOOR_LIMIT = -5;

type PlayerProps = {
  tileX: number;
  tileZ: number;
  facing: number;
  /** 화면에 실제로 그려지는 위치. 충돌 판정이 이걸 본다 */
  posRef?: { current: { x: number; z: number } };
  dead?: boolean;
  /** 치인 차의 속도. 부호가 날아갈 방향을 정한다 */
  hitSpeed?: number;
};

export function Player({
  tileX,
  tileZ,
  facing,
  posRef,
  dead = false,
  hitSpeed = 0,
}: PlayerProps) {
  const { scene } = useGLTF(MODEL_URL);
  const moveRef = useRef<THREE.Group>(null);
  const jumpRef = useRef<THREE.Group>(null);

  const startTime = useRef(0); // 이번 점프가 시작된 시각
  const from = useRef({ x: 0, z: 0 }); // 점프 출발 위치(실제 좌표)

  // 튕겨나갈 때 쓰는 속도. 매 프레임 바뀌므로 ref.
  const velocity = useRef({ x: 0, y: 0 });

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

  // 죽는 순간에 초기 속도를 정한다.
  // 점프처럼 도착점을 미리 계산하지 않고, 속도를 중력이 깎게 두면
  // 어디까지 날아갈지가 자연스럽게 나온다.
  useEffect(() => {
    if (!dead) return;

    velocity.current = {
      // 부호만 쓴다. 치인 방향으로 밀려나가야 하니까.
      x: Math.sign(hitSpeed || 1) * KNOCK_SIDE,
      y: KNOCK_UP,
    };
  }, [dead, hitSpeed]);

  useFrame((_state, delta) => {
    if (!moveRef.current || !jumpRef.current) return;

    if (posRef) {
      posRef.current.x = moveRef.current.position.x;
      posRef.current.z = moveRef.current.position.z;
    }

    // 죽었으면 칸 이동 로직을 건너뛴다.
    // 안 그러면 매 프레임 목표 칸으로 되돌아가서 날아가질 못한다.
    if (dead) {
      if (jumpRef.current.position.y > FLOOR_LIMIT) {
        velocity.current.y -= GRAVITY * delta;

        moveRef.current.position.x += velocity.current.x * delta;
        jumpRef.current.position.y += velocity.current.y * delta;

        // 공중에서 빙글빙글
        jumpRef.current.rotation.z += SPIN * delta;
      }
      return;
    }

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
        {/* 모델 자체 방향 보정. 바깥 회전(facing)과 섞이지 않게 한 겹 더 감쌌다 */}
        <group rotation={[0, MODEL_FACING_FIX, 0]} scale={MODEL_SCALE}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  );
}

// 게임 시작 전에 미리 받아둔다. 첫 점프에서 끊기지 않게.
useGLTF.preload(MODEL_URL);
