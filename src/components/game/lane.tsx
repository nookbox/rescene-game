import { type ThreeElements } from '@react-three/fiber';
import { LANE, TILE_SIZE } from '@/utils/constants';

export type LaneVariant = 'safe' | 'road' | 'crosswalk';

// 길건너기류의 룩은 텍스처가 아니라 색 대비에서 나온다.
// 잔디는 줄마다 두 톤을 번갈아 써서 칸이 몇 개인지 눈에 들어오게 한다.
const GRASS_COLORS = ['#7cc84f', '#71bd47'];
const ROAD_COLOR = '#4a4a52';

// 도로 양 끝 연석. 도로와 잔디 사이 경계를 또렷하게 해준다.
const CURB_COLOR = '#3a3a42';
const CURB_DEPTH = 0.08;

// 도로 가운데 점선
const DASH_COLOR = '#e8d9a0';
const DASH_LENGTH = 0.5;
const DASH_GAP = 0.5;
const DASH_WIDTH = 0.07;

// 횡단보도 흰 줄. 차는 X로 달리므로 줄은 Z 방향으로 눕는다.
const STRIPE_COUNT = 11;
const STRIPE_WIDTH = 0.32;
const STRIPE_DEPTH = TILE_SIZE * 0.7;
const STRIPE_COLOR = '#f2f2f2';

// 바닥과 같은 높이에 그리면 z-파이팅(두 면이 겹쳐 지직거림)이 난다.
// 아주 살짝씩 띄워 순서를 정해준다.
const Y_MARK = 0.002;

type LaneProps = ThreeElements['group'] & {
  variant: LaneVariant;
  /** 잔디 두 톤을 번갈아 쓰려고 레인 번호를 받는다 */
  index?: number;
};

/** 바닥에 눕힌 평면 하나 */
function Flat({
  width,
  depth,
  color,
  y = 0,
  x = 0,
  z = 0,
}: {
  width: number;
  depth: number;
  color: string;
  y?: number;
  x?: number;
  z?: number;
}) {
  return (
    <mesh position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function Lane({ variant, index = 0, ...props }: LaneProps) {
  const isSafe = variant === 'safe';

  if (isSafe) {
    return (
      <group {...props}>
        <Flat
          width={LANE.width}
          depth={TILE_SIZE}
          color={GRASS_COLORS[index % GRASS_COLORS.length]}
        />
      </group>
    );
  }

  // 점선을 레인 폭에 맞춰 몇 개 그릴지
  const dashCount = Math.floor(LANE.width / (DASH_LENGTH + DASH_GAP));
  const dashStep = DASH_LENGTH + DASH_GAP;

  return (
    <group {...props}>
      <Flat width={LANE.width} depth={TILE_SIZE} color={ROAD_COLOR} />

      {/* 위아래 연석 */}
      <Flat
        width={LANE.width}
        depth={CURB_DEPTH}
        color={CURB_COLOR}
        y={Y_MARK}
        z={-TILE_SIZE / 2 + CURB_DEPTH / 2}
      />
      <Flat
        width={LANE.width}
        depth={CURB_DEPTH}
        color={CURB_COLOR}
        y={Y_MARK}
        z={TILE_SIZE / 2 - CURB_DEPTH / 2}
      />

      {variant === 'crosswalk'
        ? Array.from({ length: STRIPE_COUNT }, (_, i) => (
            <Flat
              key={i}
              width={STRIPE_WIDTH}
              depth={STRIPE_DEPTH}
              color={STRIPE_COLOR}
              y={Y_MARK * 2}
              x={i - (STRIPE_COUNT - 1) / 2}
            />
          ))
        : Array.from({ length: dashCount }, (_, i) => (
            <Flat
              key={i}
              width={DASH_LENGTH}
              depth={DASH_WIDTH}
              color={DASH_COLOR}
              y={Y_MARK * 2}
              x={(i - (dashCount - 1) / 2) * dashStep}
            />
          ))}
    </group>
  );
}
