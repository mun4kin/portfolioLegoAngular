import * as THREE from 'three';

export class Sea {
  mesh: any;

  constructor() {
    const geom = new THREE.CircleGeometry(600, 600, 800);
    geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    const mat = new THREE.MeshPhongMaterial({
      color: '#0000ff',
      transparent: true,
      opacity: 0.6,
      //   Shading: THREE.FlatShading
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.receiveShadow = true;
  }

}
