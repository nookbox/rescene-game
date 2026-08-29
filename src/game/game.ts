import * as THREE from 'three';
import { PLAY_AREA } from './constants.ts';
import { Card } from './card.ts';
import { Player } from './player.ts';
import { Score } from './score.ts';

export interface GameOptions {
  onCollect?: (payload: { score: number }) => void;
  onGameOver?: (payload: { score: number }) => void;
}

export default class Game {
  private canvas: HTMLCanvasElement;
  private options: GameOptions;
  private score = new Score();

  // requestAnimationFrame이 돌려주는 id. dispose()에서 취소하려면 들고 있어야 한다.
  private rafId: number | null = null;

  // 이전 프레임 시각. delta time(프레임 간 경과 시간) 계산용.
  private lastTime = 0;

  private spawnTimer = 0;
  private spawnInterval = 1;
  private cards: Card[] = [];
  private player: Player;

  // 카드
  private cardGeometry = new THREE.BoxGeometry(0.6, 0.9, 0.05);
  private cardMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  private scene = new THREE.Scene();
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;

  constructor(canvas: HTMLCanvasElement, options: GameOptions = {}) {
    this.canvas = canvas;
    this.options = options;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
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

    this.player = new Player();
    this.scene.add(this.player.mesh);
  }

  /** 게임 루프 시작 */
  start(): void {
    // 첫 프레임의 delta가 "페이지 연 뒤 흐른 시간" 전체가 되지 않도록 지금 시각으로 맞춘다
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  private loop = (now: number): void => {
    const delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.update(delta);
    this.render();
    this.rafId = requestAnimationFrame(this.loop);
  };

  private update(delta: number): void {
    this.player.update(delta);

    this.spawnTimer += delta;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnCard();
    }

    // 지우면서 도는 루프는 거꾸로 돌려야 인덱스가 안 꼬인다
    for (let i = this.cards.length - 1; i >= 0; i--) {
      const card = this.cards[i];
      card.update(delta);

      if (card.position.distanceTo(this.player.position) < 0.8) {
        // 카드가 플레이어랑 0.8정도 가까워졌을때
        this.removeCard(i);
        this.score.add(1);
        this.options.onCollect?.({ score: this.score.value });
      } else if (card.position.y < -8) {
        // 카드가 화면 아래로 나갔을때
        this.removeCard(i);
      }
    }
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private resize(): void {}

  private spawnCard(): void {
    const card = new Card(this.cardGeometry, this.cardMaterial);
    card.position.set(
      THREE.MathUtils.randFloat(PLAY_AREA.min, PLAY_AREA.max),
      8,
      0,
    );

    this.scene.add(card.mesh);
    this.cards.push(card);
  }

  private removeCard(index: number): void {
    const card = this.cards[index];
    this.scene.remove(card.mesh);
    this.cards.splice(index, 1);
  }

  dispose(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;

    this.cardGeometry.dispose();
    this.cardMaterial.dispose();

    this.player.dispose();

    this.renderer.dispose();
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}
