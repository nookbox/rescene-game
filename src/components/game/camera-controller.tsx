import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, PerspectiveCamera } from 'three';
import { CAMERA, LANE, TILE_SIZE } from '@/utils/constants';

const BASE_DISTANCE = Math.hypot(CAMERA.height, CAMERA.distance);

export function CameraController({ tileZ }: { tileZ: number }) {
  const { camera, size } = useThree();

  useFrame((_state, delta) => {
    const cam = camera as PerspectiveCamera;
    const aspect = size.width / size.height;

    // fov는 세로 기준이라 세로 화면에서는 가로 시야가 좁아진다.
    // 레인 폭이 잘리지 않는 최소 거리를 구해 그만큼 뒤로 뺀다.
    const halfFov = MathUtils.degToRad(cam.fov / 2);
    const needed =
      (LANE.width * CAMERA.margin) / (2 * Math.tan(halfFov) * aspect);

    // height와 distance를 같은 비율로 키우면 바라보는 각도가 유지된다
    const zoom = MathUtils.clamp(needed / BASE_DISTANCE, 1, CAMERA.maxZoomOut);

    const targetZ = -tileZ * TILE_SIZE + CAMERA.distance * zoom;

    camera.position.z = MathUtils.damp(
      camera.position.z,
      targetZ,
      CAMERA.follow,
      delta,
    );
    camera.position.y = MathUtils.damp(
      camera.position.y,
      CAMERA.height * zoom,
      CAMERA.follow,
      delta,
    );
  });

  return null;
}
