export const TILE_SIZE = 1;

const LANE_WIDTH = 11;

export const LANE = {
  width: LANE_WIDTH,
  // 차가 화면 밖으로 나갔다 되돌아오는 지점. 레인 끝(-5 ~ 5)보다 3칸 바깥.
  wrap: Math.floor(LANE_WIDTH / 2) + 3,
  // 렌더할 범위. 이 밖의 레인과 차는 아예 만들지 않는다
  behind: 5,
  ahead: 14,
};

export const CAMERA = {
  // 레인 폭이 가로에 들어오도록 확보할 여유. 1이면 딱 맞고 클수록 여백이 생긴다
  margin: 1.15,
  // 세로 화면에서 카메라를 뒤로 뺄 수 있는 한계
  maxZoomOut: 2.2,
  height: 7,
  distance: 9,
  // 클수록 빠르게 따라붙는다
  follow: 9,
};

// 바라보는 방향의 Y축 회전각(라디안).
// -Z가 앞이라는 약속 기준. Y축 회전은 위에서 봤을 때 반시계가 +.
export const FACING = {
  up: 0, // 앞 (-Z)
  left: Math.PI / 2, // 왼쪽 (-X)
  right: -Math.PI / 2, // 오른쪽 (+X)
  down: Math.PI, // 뒤 (+Z)
};

// 캐릭터 치수 (가로, 높이, 깊이).
// height는 모델을 얼마나 키울지 정하는 기준,
// width는 차와의 충돌 판정에 쓰인다(car.tsx의 HIT_DISTANCE).
export const PLAYER = {
  width: 0.7,
  // 판정은 보이는 것보다 조금 작게. 스칠 때 억울하게 죽지 않는다
  hitWidth: 0.5,
  height: 0.9,
  depth: 0.7,
};

// 자동차 상자 치수
export const CAR = {
  // X축으로 달리므로 width가 차의 '길이'다
  width: 1.4,
  height: 0.5,
  depth: 1,
};

export const LIGHT = {
  ambient: 0.9,
  sun: 1.6,
};
