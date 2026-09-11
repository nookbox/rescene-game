import { type ThreeElements } from '@react-three/fiber';

// 캐릭터 상자 치수 (가로, 높이, 깊이)
const WIDTH = 0.7;
const HEIGHT = 1.5;
const DEPTH = 0.7;

type PlayerProps = ThreeElements['group'] & {
  color?: string;
};

export function Player({ color = 'white', ...props }: PlayerProps) {
  return (
    // group은 여러 mesh를 묶는 용도고 div와 비슷하다.
    <group {...props}>
      {/* mesh는 중심이 원점이라, 높이 절반만큼 올려야 발이 바닥에 닿는다.
          이 계산을 여기서 끝내두면 바깥은 y를 신경 쓸 필요가 없다. */}
      <mesh position={[0, HEIGHT / 2, 0]}>
        <boxGeometry args={[WIDTH, HEIGHT, DEPTH]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
