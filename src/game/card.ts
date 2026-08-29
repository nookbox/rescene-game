import * as THREE from 'three';

export class Card {
  mesh: THREE.Mesh;
  speed: number;

  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    speed = 3,
  ) {
    this.mesh = new THREE.Mesh(geometry, material);
    this.speed = speed;
  }

  get position(): THREE.Vector3 {
    return this.mesh.position;
  }

  update(delta: number): void {
    this.mesh.position.y -= this.speed * delta;
  }
}
