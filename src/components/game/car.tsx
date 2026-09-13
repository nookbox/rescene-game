import { LANE, PLAYER, TILE_SIZE } from '@/utils/constants';
import {
  CAR_MODELS,
  CAR_SCALE,
  carLength,
  carWidth,
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
  // 치인 차의 속도를 넘긴다. 부호가 곧 날아갈 방향.
  onHit?: (carSpeed: number) => void;
  /** 플레이어가 화면에 실제로 그려지는 위치 */
  playerPos: { current: { x: number; z: number } };
  laneIndex: number;
};

// 모델 원본은 Z축으로 길쭉하다. X축으로 달리게 하려면 90도 돌려야 한다.
// 뒤를 보고 달리는 것처럼 보이면 이 부호를 뒤집으면 된다.
const FACE_RIGHT = Math.PI / 2;
const FACE_LEFT = -Math.PI / 2;

export function Car({
  model,
  speed = 2,
  playerPos,
  laneIndex,
  onHit,
  ...props
}: CarProps) {
  const carRef = useRef<THREE.Group>(null);
  const alreadyNotifiedRef = useRef(false);

  const spec = CAR_MODELS[model];
  const { scene } = useGLTF(carModelPath(model));

  // 차마다 길이가 다르므로 판정 거리도 차마다 다르다
  const hitX = carLength(model) / 2 + PLAYER.hitWidth / 2;
  const hitZ = carWidth(model) / 2 + PLAYER.hitWidth / 2;

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

    // 칸 번호가 아니라 실제로 그려진 위치로 판정한다.
    // 칸을 쓰면 키를 누른 순간 이미 도착한 것으로 쳐서,
    // 아직 이전 레인에 서 있는데 건너편 차에 치인다.
    const laneZ = -laneIndex * TILE_SIZE;
    const gapZ = Math.abs(playerPos.current.z - laneZ);
    if (gapZ >= hitZ) return;

    const gapX = Math.abs(car.position.x - playerPos.current.x);

    if (gapX < hitX) {
      if (!alreadyNotifiedRef.current) {
        alreadyNotifiedRef.current = true;
        onHit?.(speed);
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
