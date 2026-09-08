// 플레이어가 움직일 수 있는 영역
export const PLAY_AREA = { min: -5, max: 5 } as const;

// 목숨
export const LIFE = 3;

// 한 프레임에 흘려보낼 수 있는 최대 시간(초).
// 이보다 긴 공백은 잘라낸다. 물체가 판정을 건너뛰고 통과하는 걸 막는다
export const MAX_DELTA = 0.05;

// 바닥 높이. 플레이어와 폭탄이 같은 줄에 서려면 둘이 같은 값을 봐야 한다
export const GROUND_Y = -3;

// 카드 관련 상수
export const CARD = {
  spawnY: 8, // 카드가 나타나는 높이. 화면 위쪽 바깥이라 보이지 않는 곳에서 내려온다
  despawnY: -8, // 이 높이보다 내려가면 지운다. 놓친 카드가 계속 쌓이지 않도록
  speed: 3, // 낙하 속도(칸/초)
  spawnInterval: 1, // 몇 초에 한 장씩 떨어지는지
} as const;

// 폭탄 관련 상수
export const BOMB = {
  groundY: GROUND_Y, // 플레이어와 같은 바닥에 선다
  spawnX: 13, // 좌우 화면 밖. 여기서 걸어 들어온다
  despawnX: 14, // 반대편 이 지점을 넘어가면 지운다
  // 걷는 속도도 시간이 갈수록 빨라진다. 이미 나와 있는 폭탄은 그대로고 새로 나오는 놈부터 적용된다
  speedStart: 3, // 시작 속도(칸/초)
  speedMax: 25, // 최고 속도. 여기서 멈춘다
  speedRampPerSec: 0.18, // 1초마다 이만큼씩 빨라진다. 최고 속도까지 2분쯤 걸린다
  // 스폰 간격은 시간이 갈수록 짧아진다. 여기 있는 건 그 규칙이고, 지금 간격은 Game이 들고 있다
  spawnIntervalStart: 5, // 시작 간격(초). 한 마리가 화면을 건너는 데 9초쯤 걸린다
  spawnIntervalMin: 1.2, // 아무리 빨라져도 이보다 짧아지지 않는다. 없으면 0으로 수렴해 한꺼번에 쏟아진다
  spawnRampPerSec: 0.03, // 1초마다 간격이 이만큼씩 줄어든다
} as const;
