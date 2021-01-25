import * as THREE from 'three';
import { metal } from './metal';

export class Lego {
  STUD_WIDTH: number;
  STUD_SPACING: number;
  PLATE_HEIGHT: number;
  STUD_HEIGHT: number;
  STUD_PADDING: number;
  STUD_NUM_SIDES: number;
  size: any;
  mesh: any;


  constructor(colorCode, w, h, d, opacityVal = 1) {
    // Const data = new DataToservises;
    this.STUD_WIDTH = 15.18998;
    this.STUD_SPACING = this.STUD_WIDTH / 1.5;
    this.PLATE_HEIGHT = this.STUD_SPACING;
    this.STUD_HEIGHT = this.PLATE_HEIGHT / 1.88;
    this.STUD_PADDING = this.STUD_WIDTH / 3.2;
    this.STUD_NUM_SIDES = 32;
    w = w || 1;
    h = h || 1;
    d = d || 3;
    // THREE.Object3D.call( this );
    const color = colorCode;
    const opacity = opacityVal;
    const image = document.createElement('img');
    const roughnessMap = new THREE.Texture(image);

    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(3, 3);
    image.src = metal;
    image.onload = function ( ) {
      roughnessMap.needsUpdate = true;

    };


    roughnessMap.magFilter = THREE.NearestFilter;

    const faceMaterial = new THREE.MeshStandardMaterial({
      color,
      opacity,
      transparent: true

    });


    faceMaterial.roughnessMap = roughnessMap;
    const width = this.computePlateLength(w);
    const length = this.computePlateLength(h);
    const depth = this.computePlateDepth(d);


    // Light = new THREE.PointLight( 0xff0000, 1, 100 );
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(width, depth, length), faceMaterial);
    const stud = new THREE.Mesh(new THREE.CylinderGeometry(
      this.STUD_WIDTH / 2,
      this.STUD_WIDTH / 2,
      this.STUD_HEIGHT,
      this.STUD_NUM_SIDES
    ), faceMaterial);

    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        stud.position.y = depth / 2 + this.STUD_HEIGHT / 2;
        stud.position.x =
          this.STUD_WIDTH / 2 + this.STUD_PADDING + i * (this.STUD_WIDTH + this.STUD_SPACING) - width / 2;
        stud.position.z =
          this.STUD_WIDTH / 2 + this.STUD_PADDING + j * (this.STUD_WIDTH + this.STUD_SPACING) - length / 2;
        stud.matrixAutoUpdate = false;
        stud.updateMatrix();
        this.mesh.geometry.merge(stud.geometry, stud.matrix);
      }
    }

    this.size = {
      width: w,
      height: h,
      depth: d
    };


  }

  public color(val) {
    const codes = {
      black: 0x191a1b,
      white: 0xfafafa
    };
    return codes[val];
  }

  public computePlateLength(studs) {
    return this.STUD_PADDING * 2 + studs * (this.STUD_WIDTH + this.STUD_SPACING) - this.STUD_SPACING;
  }

  public computePlateDepth(depth) {
    return depth * this.PLATE_HEIGHT;
  }

}
