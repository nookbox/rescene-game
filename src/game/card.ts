import * as THREE from 'three';

export type CardType = 'normal' | 'special' | 'bomb';

interface CardOptions {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  speed?: number;
  type?: CardType;
}

export class Card {
  mesh: THREE.Mesh;
  speed: number;
  type: CardType;

  constructor({ geometry, material, speed = 3, type = 'normal' }: CardOptions) {
    this.mesh = new THREE.Mesh(geometry, material);
    this.speed = speed;
    this.type = type;
  }

  get position(): THREE.Vector3 {
    return this.mesh.position;
  }

  update(delta: number): void {
    this.mesh.position.y -= this.speed * delta;
  }
}
