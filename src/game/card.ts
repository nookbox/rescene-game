import * as THREE from 'three';

type CardType = 'normal' | 'special' | 'bomb';
export class Card {
  mesh: THREE.Mesh;
  speed: number;
  type: CardType;

  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    speed = 3,
    type: CardType = 'normal',
  ) {
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
