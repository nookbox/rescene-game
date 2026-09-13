import { LANE } from '@/utils/constants';
import { CAR_MODELS, carLength, type CarModelName } from '@/utils/cars';

type Lane =
  | { type: 'safe' }
  | { type: 'road'; speed: number; cars: number[]; model: CarModelName };

const LANE_COUNT = 40;

// 출발하자마자 차에 치이면 억울하다. 앞 두 줄은 무조건 안전지대.
const SAFE_START = 2;

// 도로가 이보다 길게 붙어 나오면 통과가 불가능해진다.
// 앞뒤 레인의 차들이 화면에서 서로 포개져 보이는 원인이기도 하다.
const MAX_ROADS_IN_A_ROW = 2;

// 안전지대는 최소 이만큼 연속으로 깔린다.
// 한 줄짜리 안전지대는 착지하자마자 다시 뛰어야 해서 쉴 틈이 없다.
const MIN_SAFE_IN_A_ROW = 2;

// 한 도로에 놓을 차 대수의 상한. 실제 대수는 아래에서 간격을 보고 더 줄어들 수 있다.
const CARS_MIN = 2;
const CARS_MAX = 4;

// 출발(t=0)과 끝(t=1)의 값을 정해두고 그 사이를 직선으로 잇는다.
// 속도는 빨라지지만 통과할 틈도 같이 넓어져서, 어려워지되 깰 수는 있다.
const SPEED_START = { min: 1.5, max: 2.5 };
const SPEED_END = { min: 3.5, max: 5.5 };

// 차 사이에 반드시 비워둘 거리(차 몸통 제외).
const GAP_START = 2;
const GAP_END = 5;

const MODEL_NAMES = Object.keys(CAR_MODELS) as CarModelName[];

// 속도 배수가 이보다 크면 "빠른 차"로 친다 (race, race-future, 스포츠카, 경찰차)
const FAST_SPEED = 1.5;

// 차종을 뽑을 때 쓰는 가중치. 출발(t=0) → 끝(t=1) 로 보간한다.
// 빠른 차는 초반엔 거의 안 나오다가 후반에 흔해지고, 느린 차는 그 반대.
const FAST_WEIGHT = { start: 0.25, end: 3 };
const SLOW_WEIGHT = { start: 1, end: 0.5 };

// 빠른 차 도로가 연달아 붙을 수 있는 최대 줄 수.
// 1이면 빠른 도로 바로 다음 도로는 반드시 느린 차가 된다.
const MAX_FAST_IN_A_ROW = 1;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1));
}

/**
 * 차들의 시작 X좌표를 뽑는다.
 * 완전 랜덤으로 뽑으면 두 대가 겹치므로, 구간을 대수만큼 균등 분할해
 * 각 칸의 한가운데를 기준점으로 잡고 거기서 조금씩만 흔든다.
 * 겹치지 않으면서 매번 배치가 달라진다.
 */
function createCars(count: number, minGap: number, carLength: number) {
  const span = LANE.wrap * 2; // 차가 도는 전체 구간
  const spacing = span / count;

  // 흔들 수 있는 최대치. 차 몸통과 최소 간격을 빼고 남은 여유의 절반.
  const jitter = Math.max(0, (spacing - carLength - minGap) / 2);

  return Array.from(
    { length: count },
    (_, i) => -LANE.wrap + spacing * (i + 0.5) + randomBetween(-jitter, jitter),
  );
}

/**
 * 진행도 t에 따라 차종을 뽑는다.
 * 가중치를 매겨 룰렛을 돌리는 방식 — 후반일수록 빠른 차 쪽으로 기운다.
 */
function isFastModel(name: CarModelName) {
  return CAR_MODELS[name].speed >= FAST_SPEED;
}

function pickModel(t: number, allowFast: boolean): CarModelName {
  const weights = MODEL_NAMES.map((name) => {
    if (isFastModel(name)) {
      // 연속 제한에 걸리면 후보에서 아예 빼버린다
      return allowFast ? lerp(FAST_WEIGHT.start, FAST_WEIGHT.end, t) : 0;
    }
    return lerp(SLOW_WEIGHT.start, SLOW_WEIGHT.end, t);
  });

  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;

  for (let i = 0; i < MODEL_NAMES.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return MODEL_NAMES[i];
  }

  return MODEL_NAMES[MODEL_NAMES.length - 1];
}

function createRoad(t: number, allowFast: boolean) {
  const minGap = lerp(GAP_START, GAP_END, t);

  // 한 줄에는 같은 차종만 달리게 한다. 레인마다 성격이 생긴다.
  const model = pickModel(t, allowFast);
  const spec = CAR_MODELS[model];

  // 틈을 minGap만큼 확보하려면 차가 몇 대까지 들어갈 수 있나.
  // 차가 길수록(트럭 등) 적게 들어간다.
  const fits = Math.floor((LANE.wrap * 2) / (carLength(model) + minGap));
  const count = randomInt(CARS_MIN, Math.max(CARS_MIN, Math.min(CARS_MAX, fits)));

  const base = randomBetween(
    lerp(SPEED_START.min, SPEED_END.min, t),
    lerp(SPEED_START.max, SPEED_END.max, t),
  );

  // 날렵한 차는 배수가 커서 빠르고, 트럭·트랙터는 느리다
  const speed = base * spec.speed;

  return {
    type: 'road' as const,
    model,
    speed: speed * (Math.random() < 0.5 ? 1 : -1),
    cars: createCars(count, minGap, carLength(model)),
  };
}

export function createLanes() {
  const lanes: Lane[] = [];

  // 도로가 몇 줄 연속으로 나왔는지
  let roadsInARow = 0;
  // 빠른 차 도로가 몇 줄 연속으로 나왔는지
  let fastInARow = 0;
  // 안전지대가 몇 줄 연속으로 나왔는지
  let safeInARow = 0;

  const pushSafe = () => {
    lanes.push({ type: 'safe' });
    roadsInARow = 0;
    safeInARow += 1;
  };

  for (let i = 0; i < LANE_COUNT; i++) {
    if (i < SAFE_START) {
      pushSafe();
      continue;
    }

    // 0(출발) → 1(끝). 난이도 보간에 쓰는 진행도
    const t = i / (LANE_COUNT - 1);

    const mustRest = roadsInARow >= MAX_ROADS_IN_A_ROW;

    // 안전지대를 시작했으면 최소 MIN_SAFE_IN_A_ROW 줄은 채우고 넘어간다
    const needMoreSafe = safeInARow > 0 && safeInARow < MIN_SAFE_IN_A_ROW;

    if (mustRest || needMoreSafe || Math.random() < 0.4) {
      pushSafe();
      continue;
    }

    const road = createRoad(t, fastInARow < MAX_FAST_IN_A_ROW);
    lanes.push(road);

    fastInARow = isFastModel(road.model) ? fastInARow + 1 : 0;
    roadsInARow += 1;
    safeInARow = 0;
  }

  // 마지막 줄이 도로로 끝나거나 안전지대가 덜 채워진 채 루프가 끝날 수 있다.
  // 끝에도 쉴 곳을 보장해준다.
  while (safeInARow < MIN_SAFE_IN_A_ROW) {
    pushSafe();
  }

  return lanes;
}

export const lanes = createLanes();
