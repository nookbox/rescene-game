import * as THREE from 'three';
import { BOMB } from './constants.ts';

/** 걷는 동작 네 컷. 순서대로 돌린다 */
export const BOMB_RUN_FRAMES = [
  '/sprites/bomb-run-1.png',
  '/sprites/bomb-run-2.png',
  '/sprites/bomb-run-3.png',
  '/sprites/bomb-run-4.png',
];

/** 1 = 오른쪽으로 이동, -1 = 왼쪽으로 이동 */
export type BombDirection = 1 | -1;

export interface BombOptions {
  geometry: THREE.BufferGeometry;
  /** 걷기 프레임. 폭탄마다 새로 읽지 않도록 Game이 한 번 읽어서 넘긴다 */
  textures: THREE.Texture[];
  /** 어느 쪽에서 나왔는지에 따라 정해진다. 왼쪽 끝에서 나왔으면 1 */
  direction: BombDirection;
  speed?: number;
}

export class Bomb {
  mesh: THREE.Mesh;
  speed: number;
  direction: BombDirection;

  // 재질은 폭탄마다 따로 둔다. 프레임이 제각각 돌아가야 하므로 공유할 수 없다
  private material: THREE.MeshBasicMaterial;
  private textures: THREE.Texture[];

  // 걷기 프레임 재생
  private frameIndex = 0;
  private frameTimer = 0;

  constructor({ geometry, textures, direction, speed = 3 }: BombOptions) {
    this.textures = textures;
    this.speed = speed;
    this.direction = direction;

    this.material = new THREE.MeshBasicMaterial({
      map: textures[0],
      transparent: true,
      alphaTest: 0.15,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);

    // 오른쪽으로 갈 때가 원본 그림이 보는 방향. 왼쪽으로 갈 때만 좌우를 뒤집는다
    this.mesh.scale.x = direction;
  }

  get position(): THREE.Vector3 {
    return this.mesh.position;
  }

  /** 화면을 가로질러 반대편으로 나갔는지. 나간 폭탄은 지운다 */
  get isOffScreen(): boolean {
    return this.direction > 0
      ? this.mesh.position.x > BOMB.despawnX
      : this.mesh.position.x < -BOMB.despawnX;
  }

  update(delta: number): void {
    this.mesh.position.x += this.direction * this.speed * delta;
    this.updateFrame(delta);
  }

  private updateFrame(delta: number): void {
    this.frameTimer += delta;

    while (this.frameTimer >= BOMB.frameDuration) {
      this.frameTimer -= BOMB.frameDuration;
      this.frameIndex = (this.frameIndex + 1) % this.textures.length;
    }

    const texture = this.textures[this.frameIndex];
    if (this.material.map === texture) return;

    this.material.map = texture;
    this.material.needsUpdate = true;
  }

  /** 씬에서 빠질 때 호출. 텍스처는 공유물이라 여기서 건드리지 않는다 */
  dispose(): void {
    this.material.dispose();
  }
}
