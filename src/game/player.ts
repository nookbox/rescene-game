import * as THREE from 'three';
import { PLAY_AREA } from './constants.ts';

export class Player {
  mesh: THREE.Mesh;
  speed: number;

  private geometry = new THREE.BoxGeometry(1, 1, 1);
  private material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  private velocityY = 0;
  private readonly gravity = 54; // 중력 가속도 (칸/초²)
  private readonly jumpForce = 18; // 점프 초기 속도 (칸/초)
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
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(0, this.floorY, 0);
    this.speed = speed;

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  get position(): THREE.Vector3 {
    return this.mesh.position;
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

  update(delta: number): void {
    if (this.keys['ArrowLeft']) {
      this.mesh.position.x -= this.speed * delta;
    }
    if (this.keys['ArrowRight']) {
      this.mesh.position.x += this.speed * delta;
    }

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
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);

    this.geometry.dispose();
    this.material.dispose();
  }
}
