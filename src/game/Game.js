import * as THREE from 'three';

export default class Game {
  constructor(canvas, options = {}) {
    this.score = 0;

    this.canvas = canvas;
    this.options = options;

    // requestAnimationFrame이 돌려주는 id. dispose()에서 취소하려면 들고 있어야 한다.
    this.rafId = null;

    // 이전 프레임 시각. delta time(프레임 간 경과 시간) 계산용.
    this.lastTime = 0;

    // card 스폰
    this.spawnTimer = 0; // 마지막으로 만든 지 몇 초 지났나
    this.spawnInterval = 1; // 몇 초마다 만들까

    this.cards = [];

    // 카드 생성
    this.cardGeometry = new THREE.BoxGeometry(0.6, 0.9, 0.05);
    this.cardMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      false,
    );

    const fov = 75;
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    const near = 0.1;
    const far = 100;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    this.camera.position.set(0, 2, 8);
    this.camera.lookAt(0, 1, 0);

    this.scene = new THREE.Scene();

    // TODO(2단계): 바닥과 큐브 하나 올려보기
    this.material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.cube = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.cube);

    this.keys = {};

    this.onKeyDown = (e) => {
      this.keys[e.code] = true;
    };
    this.onKeyUp = (e) => {
      this.keys[e.code] = false;
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  /** 게임 루프 시작 */
  start() {
    const loop = (time) => {
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
    const speed = 5; // 1초에 5칸
    const cardSpeed = 3;

    if (this.keys['ArrowLeft']) this.cube.position.x -= speed * delta;
    if (this.keys['ArrowRight']) this.cube.position.x += speed * delta;

    // 벽 생성, 좌 우 한계 이동 제한
    this.cube.position.x = THREE.MathUtils.clamp(this.cube.position.x, -5, 5);

    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnCard();
    }

    for (let i = this.cards.length - 1; i >= 0; i--) {
      const card = this.cards[i];

      card.position.y -= cardSpeed * delta;
      if (card.position.distanceTo(this.cube.position) < 0.8) {
        // 받았다
        this.score++;
        console.log('점수:', this.score);
        this.scene.remove(card);
        this.cards.splice(i, 1);
      } else if (card.position.y < -8) {
        // 놓쳤다
        this.scene.remove(card);
        this.cards.splice(i, 1);
      }
    }
  }

  spawnCard() {
    const card = new THREE.Mesh(this.cardGeometry, this.cardMaterial);
    card.position.set(THREE.MathUtils.randFloat(-5, 5), 8, 0);
    this.scene.add(card);
    this.cards.push(card);
  }

  /** 매 프레임 화면에 그리기 */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * 뒷정리. 이걸 안 하면 StrictMode에서 게임이 2개 돌아가고,
   * 페이지를 옮겨도 GPU 메모리가 안 풀린다.
   */
  dispose() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    // TODO: geometry.dispose() / material.dispose() / renderer.dispose()
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}
