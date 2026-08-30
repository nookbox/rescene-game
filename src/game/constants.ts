// 플레이어가 움직일 수 있는 영역
export const PLAY_AREA = { min: -5, max: 5 } as const;

// 목숨
export const LIFE = 3;

// 카드 관련 상수
export const CARD = {
  spawnY: 8, // 카드가 나타나는 높이. 화면 위쪽 바깥이라 보이지 않는 곳에서 내려온다
  despawnY: -8, // 이 높이보다 내려가면 지운다. 놓친 카드가 계속 쌓이지 않도록
  speed: 3, // 낙하 속도(칸/초)
  bombChance: 0.2, // 폭탄이 나올 확률.
} as const;
