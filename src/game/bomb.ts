import * as THREE from 'three';
import { BOMB } from './constants.ts';

/** 1 = 오른쪽으로 이동, -1 = 왼쪽으로 이동 */
export type BombDirection = 1 | -1;

export interface BombOptions {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  /** 어느 쪽에서 나왔는지에 따라 정해진다. 왼쪽 끝에서 나왔으면 1 */
  direction: BombDirection;
  speed?: number;
}

export class Bomb {
  mesh: THREE.Mesh;
  speed: number;
  direction: BombDirection;

  constructor({ geometry, material, direction, speed = 3 }: BombOptions) {
    this.mesh = new THREE.Mesh(geometry, material);
    this.speed = speed;
    this.direction = direction;
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
  }
}
