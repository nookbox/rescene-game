import * as THREE from 'three';
import { PLAY_AREA, LIFE, CARD, BOMB, MAX_DELTA } from './constants.ts';
import { Card } from './card.ts';
import { Player } from './player.ts';
import { Score } from './score.ts';
import { Life } from './life.ts';
import type { GameOptions } from './types.ts';
import { Bomb, BOMB_RUN_FRAMES, type BombDirection } from './bomb.ts';

export default class Game {
  private canvas: HTMLCanvasElement;
  private options: GameOptions;
  private score = new Score();
  private life = new Life(LIFE);
  private isGameOver = false;

  // 게임오버 직전, 피격 모션을 보여줄 시간
  private dying = false;
  private deathTimer = 0;
  private readonly deathDuration = 0.15;

  // requestAnimationFrame이 돌려주는 id. dispose()에서 취소하려면 들고 있어야 한다.
  private rafId: number | null = null;

  // 이전 프레임 시각. delta time(프레임 간 경과 시간) 계산용.
  private lastTime = 0;

  private spawnTimer = 0;

  // 게임 시작 후 흐른 시간. 폭탄이 언제부터 나올지 판단하는 기준
  private elapsed = 0;
  private spawnTimerBomb = 0;
  // 지금 폭탄 스폰 간격. 시간이 갈수록 짧아져서 상수가 아니라 상태다
  private bombSpawnInterval: number = BOMB.spawnIntervalStart;
  // 다음에 나올 폭탄의 걷는 속도. 이것도 시간에 따라 변한다
  private bombSpeed: number = BOMB.speedStart;
  // 다음 폭탄까지 기다릴 시간. 한 마리 나올 때마다 새로 뽑는다
  private nextBombDelay: number = BOMB.spawnIntervalStart;

  private cards: Card[] = [];
  private bombs: Bomb[] = [];
  private player: Player;

  // 카드
  private cardGeometry = new THREE.BoxGeometry(0.6, 0.9, 0.05);
  private cardMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  // 폭탄. 재질은 프레임이 제각각 돌아가야 해서 폭탄이 각자 만든다
  private bombGeometry = new THREE.PlaneGeometry(
    BOMB.spriteSize,
    BOMB.spriteSize,
  );
  private bombTextures: THREE.Texture[];

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

    const loader = new THREE.TextureLoader();
    this.bombTextures = BOMB_RUN_FRAMES.map((path) => {
      const texture = loader.load(path);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      return texture;
    });

    this.player = new Player();
    this.scene.add(this.player.mesh);
  }

  /** 게임 루프 시작 */
  start(): void {
    // 첫 프레임의 delta가 "페이지 연 뒤 흐른 시간" 전체가 되지 않도록 지금 시각으로 맞춘다
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  private emitChange(): void {
    this.options.onChange?.({
      score: this.score.value,
      life: this.life.value,
    });
  }

  private loop = (now: number): void => {
    // 탭을 옮겼다 오거나 프레임이 끊기면 delta가 몇 초짜리로 들어온다.
    // 그대로 쓰면 폭탄이 한 프레임에 수십 칸을 건너뛰어 플레이어를 통과해버린다
    const delta = Math.min((now - this.lastTime) / 1000, MAX_DELTA);
    this.lastTime = now;

    this.update(delta);
    this.render();

    if (this.isGameOver) return;
    this.rafId = requestAnimationFrame(this.loop);
  };

  private update(delta: number): void {
    this.player.update(delta);

    // 게임오버 연출 중. 스폰과 충돌 판정은 멈추고 피격 모션만 보여준 뒤 끝낸다
    if (this.dying) {
      this.deathTimer -= delta;

      for (const card of this.cards) {
        card.update(delta);
      }

      if (this.deathTimer <= 0) {
        this.isGameOver = true;
        this.options.onGameOver?.({ score: this.score.value });
      }
      return;
    }

    this.elapsed += delta;

    this.spawnTimer += delta;
    if (this.spawnTimer >= CARD.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnCard();
    }

    // 시간이 지날수록 폭탄이 자주 나온다. 최소 간격 아래로는 내려가지 않는다
    this.bombSpawnInterval = Math.max(
      BOMB.spawnIntervalMin,
      this.bombSpawnInterval - BOMB.spawnRampPerSec * delta,
    );

    // 걷는 속도도 같이 빨라진다. 최고 속도에서 멈춘다
    this.bombSpeed = Math.min(
      BOMB.speedMax,
      this.bombSpeed + BOMB.speedRampPerSec * delta,
    );

    // 초반 유예 시간. 난이도는 위에서 계속 오르고 있으므로,
    // 폭탄이 처음 나올 때는 이미 그만큼 빠르고 잦은 상태로 시작한다
    if (this.elapsed >= BOMB.startDelay) {
      this.spawnTimerBomb += delta;
      if (this.spawnTimerBomb >= this.nextBombDelay) {
        this.spawnTimerBomb = 0;
        this.nextBombDelay = this.rollBombDelay();
        this.spawnBomb();
      }
    }

    // 지우면서 도는 루프는 거꾸로 돌려야 인덱스가 안 꼬인다
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];
      bomb.update(delta);

      if (bomb.position.distanceTo(this.player.position) < 0.8) {
        this.life.decrease();
        this.player.hit();
        this.removeBomb(i);
        this.emitChange();

        if (this.life.isDead) {
          this.dying = true;
          this.deathTimer = this.deathDuration;
          this.player.die();
        }
      }

      if (bomb.isOffScreen) this.removeBomb(i);
    }

    // 지우면서 도는 루프는 거꾸로 돌려야 인덱스가 안 꼬인다
    for (let i = this.cards.length - 1; i >= 0; i--) {
      const card = this.cards[i];
      card.update(delta);

      // 카드가 플레이어랑 0.8정도 가까워졌을때
      if (card.position.distanceTo(this.player.position) < 0.8) {
        // if (card.type === 'bomb') {
        //   this.life.decrease();
        //   this.player.hit();
        //   this.removeCard(i);
        //   this.emitChange();

        //   if (this.life.isDead) {
        //     this.dying = true;
        //     this.deathTimer = this.deathDuration;
        //     this.player.die();
        //   }
        //   continue; // 폭탄이면 점수 안 올리고 다음 카드로
        if (card.type === 'normal') {
          this.removeCard(i);
          this.score.add(1);
          this.emitChange();
        }
      } else if (card.position.y < CARD.despawnY) {
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
    const material = this.cardMaterial;

    // TODO: 나중에 확률로 'special' 카드 섞기
    const card = new Card({
      geometry: this.cardGeometry,
      material,
      speed: CARD.speed,
    });

    card.position.set(
      THREE.MathUtils.randFloat(PLAY_AREA.min, PLAY_AREA.max),
      CARD.spawnY,
      0,
    );

    this.scene.add(card.mesh);
    this.cards.push(card);
  }

  /**
   * 다음 폭탄까지 기다릴 시간을 뽑는다.
   */
  private rollBombDelay(): number {
    return (
      this.bombSpawnInterval *
      THREE.MathUtils.randFloat(1 - BOMB.spawnJitter, 1 + BOMB.spawnJitter)
    );
  }

  private spawnBomb(): void {
    // 어느 쪽에서 나올지
    const fromLeft = Math.random() < 0.5;
    const direction: BombDirection = fromLeft ? 1 : -1;

    const bomb = new Bomb({
      geometry: this.bombGeometry,
      textures: this.bombTextures,
      speed: this.bombSpeed,
      direction,
    });

    // x: 화면 밖 좌우 끝. 나온 쪽 반대편으로 걸어가 화면을 가로지른다
    // y: 플레이어와 같은 바닥. z: 카드/플레이어와 같은 평면
    bomb.position.set(fromLeft ? -BOMB.spawnX : BOMB.spawnX, BOMB.groundY, 0);

    this.scene.add(bomb.mesh);
    this.bombs.push(bomb);
  }

  private removeCard(index: number): void {
    const card = this.cards[index];
    this.scene.remove(card.mesh);
    this.cards.splice(index, 1);
  }

  private removeBomb(index: number): void {
    const bomb = this.bombs[index];
    this.scene.remove(bomb.mesh);
    bomb.dispose(); // 폭탄마다 재질을 따로 만들었으니 여기서 풀어준다
    this.bombs.splice(index, 1);
  }

  dispose(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;

    this.cardGeometry.dispose();
    this.cardMaterial.dispose();

    this.bombGeometry.dispose();
    for (const bomb of this.bombs) bomb.dispose();
    for (const texture of this.bombTextures) texture.dispose();

    this.player.dispose();
    this.renderer.dispose();
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}
