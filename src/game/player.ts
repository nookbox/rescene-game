import * as THREE from 'three';
import { PLAY_AREA } from './constants.ts';

export class Player {
  mesh: THREE.Mesh;
  speed: number;

  private geometry = new THREE.BoxGeometry(1, 1, 1);
  private material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  private keys: Record<string, boolean> = {};

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys[e.code] = true;
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys[e.code] = false;
  };

  constructor(speed = 3) {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(0, -3, 0); // 시작 자리는 캐릭터 본인의 사정
    this.speed = speed;

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  get position(): THREE.Vector3 {
    return this.mesh.position;
  }

  update(delta: number): void {
    if (this.keys['ArrowLeft']) {
      this.mesh.position.x -= this.speed * delta;
    }
    if (this.keys['ArrowRight']) {
      this.mesh.position.x += this.speed * delta;
    }

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
