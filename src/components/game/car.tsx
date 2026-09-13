import { LANE, PLAYER, TILE_SIZE } from '@/utils/constants';
import {
  CAR_MODELS,
  CAR_SCALE,
  carLength,
  carModelPath,
  type CarModelName,
} from '@/utils/cars';
import { Clone, useGLTF } from '@react-three/drei';
import { ThreeElements, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type CarProps = ThreeElements['group'] & {
  model: CarModelName;
  speed?: number;
  onHit?: () => void;
  playerTileX: number;
  playerTileZ: number;
  laneIndex: number;
};

// 모델 원본은 Z축으로 길쭉하다. X축으로 달리게 하려면 90도 돌려야 한다.
// 뒤를 보고 달리는 것처럼 보이면 이 부호를 뒤집으면 된다.
const FACE_RIGHT = Math.PI / 2;
const FACE_LEFT = -Math.PI / 2;

export function Car({
  model,
  speed = 2,
  playerTileX,
  playerTileZ,
  laneIndex,
  onHit,
  ...props
}: CarProps) {
  const carRef = useRef<THREE.Group>(null);
  const alreadyNotifiedRef = useRef(false);

  const spec = CAR_MODELS[model];
  const { scene } = useGLTF(carModelPath(model));

  // 차마다 길이가 다르므로 판정 거리도 차마다 다르다
  const hitDistance = carLength(model) / 2 + PLAYER.width / 2;

  useFrame((_state, delta) => {
    if (!carRef.current) return;
    const car = carRef.current;

    car.position.x += speed * delta;

    // 오른쪽으로 가는 차는 오른쪽 끝을 넘으면 왼쪽에서 다시 들어온다
    if (speed > 0 && car.position.x > LANE.wrap) {
      car.position.x = -LANE.wrap;
    }

    // 왼쪽으로 가는 차(speed가 음수)는 반대.
    if (speed < 0 && car.position.x < -LANE.wrap) {
      car.position.x = LANE.wrap;
    }

    // 같은 레인인가
    if (laneIndex !== playerTileZ) return;

    // x가 겹치는가 — 중심 사이 거리로 판정
    const playerX = playerTileX * TILE_SIZE;
    const gap = Math.abs(car.position.x - playerX);

    if (gap < hitDistance) {
      if (!alreadyNotifiedRef.current) {
        alreadyNotifiedRef.current = true;
        onHit?.();
      }
    } else {
      alreadyNotifiedRef.current = false;
    }
  });

  return (
    <group ref={carRef} {...props}>
      {/* useGLTF가 준 scene은 하나뿐이라 여러 곳에 그대로 쓰면 마지막 하나만 보인다.
          Clone이 매번 복사본을 만들어준다. */}
      <Clone
        object={scene}
        scale={CAR_SCALE}
        position={[0, spec.lift * CAR_SCALE, 0]}
        rotation={[0, speed >= 0 ? FACE_RIGHT : FACE_LEFT, 0]}
      />
    </group>
  );
}

// 미리 불러두면 게임 중에 차가 늦게 나타나는 일이 줄어든다
Object.keys(CAR_MODELS).forEach((name) => {
  useGLTF.preload(carModelPath(name as CarModelName));
});
