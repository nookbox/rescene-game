import { CAR, LANE } from '@/utils/constants';

type Lane = { type: 'safe' } | { type: 'road'; speed: number; cars: number[] };

const LANE_COUNT = 40;

// 출발하자마자 차에 치이면 억울하다. 앞 두 줄은 무조건 안전지대.
const SAFE_START = 2;

// 한 도로에 놓을 차 대수
const CARS_MIN = 2;
const CARS_MAX = 4;

// 속도는 절댓값 범위. 부호(방향)는 따로 뽑는다.
const SPEED_MIN = 1.5;
const SPEED_MAX = 4;

// 차 사이에 최소한 이만큼은 비워둔다. 플레이어가 빠져나갈 틈.
const MIN_GAP = 2;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1));
}

/**
 * 차들의 시작 X좌표를 뽑는다.
 * 완전 랜덤으로 뽑으면 두 대가 겹쳐버리므로,
 * 구간을 대수만큼 균등 분할해 각 칸의 한가운데를 기준점으로 잡고
 * 거기서 조금씩만 흔든다. 겹치지 않으면서 매번 배치가 달라진다.
 */
function createCars(count: number) {
  const span = LANE.wrap * 2; // 차가 도는 전체 구간
  const spacing = span / count;

  // 흔들 수 있는 최대치. 차 길이와 최소 간격을 빼고 남은 여유의 절반.
  const jitter = Math.max(0, (spacing - CAR.width - MIN_GAP) / 2);

  return Array.from(
    { length: count },
    (_, i) =>
      -LANE.wrap + spacing * (i + 0.5) + randomBetween(-jitter, jitter),
  );
}

export function createLanes() {
  const lanes: Lane[] = [];

  for (let i = 0; i < LANE_COUNT; i++) {
    if (i < SAFE_START) {
      lanes.push({ type: 'safe' });
      continue;
    }

    if (Math.random() < 0.5) {
      lanes.push({ type: 'safe' });
      continue;
    }

    const direction = Math.random() < 0.5 ? 1 : -1;

    lanes.push({
      type: 'road',
      speed: randomBetween(SPEED_MIN, SPEED_MAX) * direction,
      cars: createCars(randomInt(CARS_MIN, CARS_MAX)),
    });
  }

  return lanes;
}

export const lanes = createLanes();
