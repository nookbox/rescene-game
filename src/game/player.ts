import * as THREE from 'three';
import { PLAY_AREA } from './constants.ts';

type PlayerState = 'idle' | 'run' | 'jump' | 'hit';

type StillState = Exclude<PlayerState, 'run'>;

const SPRITES: Record<StillState, string> = {
  idle: '/sprites/remine-idle.png',
  jump: '/sprites/remine-jump.png',
  hit: '/sprites/remine-hit.png',
};

// 달리기는 세 컷을 순서대로
const RUN_FRAMES = [
  '/sprites/remine-run.png',
  '/sprites/remine-run-a.png',
  '/sprites/remine-run-b.png',
];

const SPRITE_SIZE = 1.8;

export class Player {
  mesh: THREE.Mesh;
  speed: number;

  private geometry = new THREE.PlaneGeometry(SPRITE_SIZE, SPRITE_SIZE);
  private textures: Record<StillState, THREE.Texture>;
  private runTextures: THREE.Texture[];
  private material: THREE.MeshBasicMaterial;

  private state: PlayerState = 'idle';
  private facing = 1; // 1 = 오른쪽(원본 그림 방향), -1 = 왼쪽
  private hitTimer = 0; // 피격 모션이 남은 시간(초)
  private readonly hitDuration = 0.6;
  private isDead = false; // 게임오버. 입력을 막고 피격 모션으로 굳는다

  // 달리기 프레임 재생
  private runIndex = 0;
  private runTimer = 0;
  private readonly frameDuration = 0.1; // 한 컷이 머무는 시간(초)

  // 그림 위에 얹는 반동. 프레임이 이미 움직이니 살짝만 준다
  private runPhase = 0;
  private readonly stepRate = 11; // 발걸음 빠르기
  private readonly bobHeight = 0.06; // 튀어오르는 높이(칸)

  private velocityY = 0;
  private readonly gravity = 54; // 중력 가속도 (칸/초²)
  private readonly jumpForce = 16; // 점프 초기 속도 (칸/초)
  private isJumping = false;
  private readonly floorY = -3; // 바닥 높이 = 시작 높이

  private keys: Record<string, boolean> = {};

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys[e.code] = true;
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys[e.code] = false;
  };

  constructor(speed = 3) {
    const loader = new THREE.TextureLoader();
    const load = (path: string): THREE.Texture => {
      const texture = loader.load(path);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      return texture;
    };

    this.textures = {
      idle: load(SPRITES.idle),
      jump: load(SPRITES.jump),
      hit: load(SPRITES.hit),
    };
    this.runTextures = RUN_FRAMES.map(load);

    this.material = new THREE.MeshBasicMaterial({
      map: this.textures.idle,
      transparent: true,
      alphaTest: 0.15,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(0, this.floorY, 0);
    this.speed = speed;

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  get position(): THREE.Vector3 {
    return this.mesh.position;
  }

  /** 폭탄에 맞았을 때 호출. 잠깐 피격 모션으로 바뀐다. */
  hit(): void {
    this.hitTimer = this.hitDuration;
    // 이번 프레임 render()에 바로 반영되도록 상태를 즉시 바꾼다
    this.setState('hit');
  }

  /** 목숨이 다했을 때 호출. 입력을 막고 피격 모션으로 고정된다. */
  die(): void {
    this.isDead = true;
    this.hit();
  }

  private setState(next: StillState): void {
    if (this.state === next) return;
    this.state = next;
    this.setTexture(this.textures[next]);
  }

  private setTexture(texture: THREE.Texture): void {
    if (this.material.map === texture) return;
    this.material.map = texture;
    this.material.needsUpdate = true;
  }

  private updateRunFrame(delta: number): void {
    if (this.state !== 'run') {
      this.state = 'run';
      this.runIndex = 0;
      this.runTimer = 0;
    }

    this.runTimer += delta;
    while (this.runTimer >= this.frameDuration) {
      this.runTimer -= this.frameDuration;
      this.runIndex = (this.runIndex + 1) % this.runTextures.length;
    }

    this.setTexture(this.runTextures[this.runIndex]);
  }

  private updateJump(delta: number): void {
    if (this.isJumping) {
      this.mesh.position.y += this.velocityY * delta;
      this.velocityY -= this.gravity * delta; // 중력 적용

      // 바닥에 도달했을 때
      if (this.mesh.position.y <= this.floorY) {
        this.mesh.position.y = this.floorY;
        this.isJumping = false;
        this.velocityY = 0;
      }
    }
  }

  /** 달릴 때만 반동을 준다. 점프 중에는 물리가 y를 잡고 있으니 건드리지 않는다. */
  private updateRunBob(delta: number, moveX: number): void {
    if (this.isJumping) return;

    if (moveX === 0) {
      this.runPhase = 0;
      this.mesh.position.y = this.floorY;
      this.mesh.scale.y = 1;
      this.mesh.rotation.z = 0;
      return;
    }

    this.runPhase += delta * this.stepRate;

    const bob = Math.abs(Math.sin(this.runPhase)) * this.bobHeight;
    this.mesh.position.y = this.floorY + bob;
    // 발이 땅에 닿는 순간(bob이 0에 가까울 때) 살짝 눌린다
    this.mesh.scale.y = 1 - (this.bobHeight - bob) * 0.6;
    // 가는 방향으로 몸을 조금 기울인다
    this.mesh.rotation.z = this.facing * Math.sin(this.runPhase * 0.5) * 0.035;
  }

  update(delta: number): void {
    // 죽은 뒤에는 조작을 막되, 공중이었다면 떨어지기는 해야 한다
    if (this.isDead) {
      this.updateJump(delta);
      return;
    }

    let moveX = 0;

    if (this.keys['ArrowLeft']) {
      moveX -= 1;
    }
    if (this.keys['ArrowRight']) {
      moveX += 1;
    }

    this.mesh.position.x += moveX * this.speed * delta;

    if (this.keys['ArrowUp'] && !this.isJumping) {
      this.velocityY = this.jumpForce;
      this.isJumping = true;
    }

    // 물리는 키와 상관없이 매 프레임 돌아야 한다 (키를 떼도 떨어지도록)
    this.updateJump(delta);

    // 벽 생성. 플레이어가 화면 밖으로 나가지 않도록.
    this.mesh.position.x = THREE.MathUtils.clamp(
      this.mesh.position.x,
      PLAY_AREA.min,
      PLAY_AREA.max,
    );

    if (this.hitTimer > 0) this.hitTimer -= delta;

    // 방향 전환은 그림을 좌우로 뒤집어서 처리
    if (moveX !== 0) this.facing = moveX > 0 ? 1 : -1;
    this.mesh.scale.x = this.facing;

    this.updateRunBob(delta, moveX);

    if (this.hitTimer > 0) {
      this.setState('hit');
    } else if (this.isJumping) {
      this.setState('jump');
    } else if (moveX !== 0) {
      this.updateRunFrame(delta);
    } else {
      this.setState('idle');
    }
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);

    this.geometry.dispose();
    this.material.dispose();

    for (const texture of Object.values(this.textures)) {
      texture.dispose();
    }
    for (const texture of this.runTextures) {
      texture.dispose();
    }
  }
}
