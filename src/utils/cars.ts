// Kenney Car Kit (CC0) 모델 목록.
//
// - speed  : 기본 속도 배수. 날렵하게 생긴 차일수록 빠르다.
// - length : 모델의 진행 방향 길이. 충돌 판정에 쓴다.
//            원본은 Z축으로 길쭉한데, 90도 돌려서 X축으로 달리게 하므로
//            원본의 z 크기가 곧 진행 방향 길이가 된다.
// - lift   : 바퀴가 원점보다 아래에 있어서 띄워줘야 하는 높이.
export const CAR_MODELS = {
  // 날렵한 차 — 빠르게
  race: { file: 'race.glb', speed: 2.2, length: 2.56, width: 1.2, lift: 0.3 },
  raceFuture: { file: 'race-future.glb', speed: 2.0, length: 2.66, width: 1.2, lift: 0.3 },
  sedanSports: { file: 'sedan-sports.glb', speed: 1.7, length: 2.55, width: 1.3, lift: 0.3 },
  hatchbackSports: {
    file: 'hatchback-sports.glb',
    speed: 1.6,
    length: 2.85, width: 1.3,
    lift: 0.3,
  },
  police: { file: 'police.glb', speed: 1.5, length: 2.9, width: 1.5, lift: 0.3 },

  // 보통
  sedan: { file: 'sedan.glb', speed: 1.0, length: 2.55, width: 1.5, lift: 0.3 },
  taxi: { file: 'taxi.glb', speed: 1.0, length: 2.75, width: 1.5, lift: 0.3 },
  suv: { file: 'suv.glb', speed: 0.9, length: 2.55, width: 1.5, lift: 0.3 },

  // 둔한 차 — 느리게
  ambulance: { file: 'ambulance.glb', speed: 0.7, length: 3.25, width: 1.5, lift: 0.3 },
  firetruck: { file: 'firetruck.glb', speed: 0.6, length: 3.25, width: 1.5, lift: 0.3 },
  garbageTruck: {
    file: 'garbage-truck.glb',
    speed: 0.55,
    length: 3.45, width: 1.6,
    lift: 0.3,
  },
  tractor: { file: 'tractor.glb', speed: 0.4, length: 1.98, width: 1.34, lift: 0.53 },
} as const;

// 원본 모델은 칸(TILE_SIZE=1)에 비해 2.5~3.5배로 너무 크다.
// 전부에 같은 배율을 곱하므로 차종 간 크기 차이는 유지된다.
// 이 값만 바꾸면 그리기·충돌 판정·차 간격이 함께 따라온다.
export const CAR_SCALE = 0.6;

export type CarModelName = keyof typeof CAR_MODELS;

// 화면에 실제로 그려지는 길이. 충돌 판정과 간격 계산은 이걸 써야 한다.
export const carLength = (name: CarModelName) =>
  CAR_MODELS[name].length * CAR_SCALE;

// 레인을 가로지르는 쪽 폭. 90도 돌려 놓으므로 원본의 x가 화면상 z가 된다.
export const carWidth = (name: CarModelName) =>
  CAR_MODELS[name].width * CAR_SCALE;

export const carModelPath = (name: CarModelName) =>
  `/models/cars/${CAR_MODELS[name].file}`;
