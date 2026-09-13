import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils } from 'three';
import { CAMERA, TILE_SIZE } from '@/utils/constants';

export function CameraController({ tileZ }: { tileZ: number }) {
  const { camera } = useThree();

  useFrame((_state, delta) => {
    // Player와 같은 변환을 써야 같은 좌표계에 있게 됨
    const playerZ = -tileZ * TILE_SIZE;

    // 플레이어보다 distance 만큼 뒤에 선다
    const targetZ = playerZ + CAMERA.distance;

    // 모니터 주사율이 달라도 같은 속도로 따라붙게
    camera.position.z = MathUtils.damp(
      camera.position.z,
      targetZ,
      CAMERA.follow,
      delta,
    );
  });

  return null;
}
