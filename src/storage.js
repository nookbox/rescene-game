// 기록 저장. localStorage는 문자열만 담을 수 있어서 JSON으로 감싼다.
// 나중에 서버 DB로 바꾸더라도 이 파일의 함수 시그니처만 유지하면
// 게임 코드는 하나도 안 고쳐도 된다.

const KEY = "rescene-game";

export function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {}; // 저장된 값이 깨졌을 때 앱이 죽지 않도록
  }
}

export function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
