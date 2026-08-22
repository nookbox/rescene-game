import * as THREE from "three";

/**
 * 게임의 본체.
 *
 * 규칙: 이 폴더(src/game/)의 파일들은 React를 전혀 몰라야 한다.
 * 순수 three.js + 순수 JS만. 그래야 나중에 다른 프레임워크로 옮기거나
 * React Three Fiber로 갈아탈 때 이 코드를 그대로 재활용할 수 있다.
 *
 * 바깥(React)에 노출하는 것은 딱 3개:
 *   - constructor(canvas, options)
 *   - start()
 *   - dispose()
 */
export default class Game {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = options;

    // requestAnimationFrame이 돌려주는 id. dispose()에서 취소하려면 들고 있어야 한다.
    this.rafId = null;

    // 이전 프레임 시각. delta time(프레임 간 경과 시간) 계산용.
    this.lastTime = 0;

    console.log("[Game] three.js revision:", THREE.REVISION);

    // TODO(1단계): scene / camera / renderer 만들기
    // TODO(2단계): 바닥과 큐브 하나 올려보기
    // TODO(3단계): 키보드 입력 받기
  }

  /** 게임 루프 시작 */
  start() {
    const loop = (time) => {
      // delta는 "이전 프레임에서 지금까지 몇 초 흘렀나". 단위: 초.
      // 모든 움직임에 이걸 곱해야 60fps든 144fps든 같은 속도로 움직인다.
      const delta = (time - this.lastTime) / 1000;
      this.lastTime = time;

      this.update(delta);
      this.render();

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  /** 매 프레임 상태를 갱신 (위치 이동, 충돌 판정, 점수 등) */
  update(delta) {
    // TODO: 여기에 게임 로직
  }

  /** 매 프레임 화면에 그리기 */
  render() {
    // TODO: this.renderer.render(this.scene, this.camera);
  }

  /**
   * 뒷정리. 이걸 안 하면 StrictMode에서 게임이 2개 돌아가고,
   * 페이지를 옮겨도 GPU 메모리가 안 풀린다.
   */
  dispose() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;

    // TODO: 이벤트 리스너 해제 (resize, keydown ...)
    // TODO: geometry.dispose() / material.dispose() / renderer.dispose()
  }
}
