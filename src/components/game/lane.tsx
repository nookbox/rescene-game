import { type ThreeElements } from '@react-three/fiber';

type LaneProps = ThreeElements['mesh'] & {
  width?: number;
  depth?: number;
  color?: string;
};

export function Lane({
  width = 10,
  depth = 10,
  color = 'orange',
  ...props
}: LaneProps) {
  return (
    <mesh {...props}>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
