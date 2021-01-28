import * as THREE from 'three';


export class Lego {
  mesh: THREE.Mesh;
  size: { width: number, height: number, depth: number };
  CUBE_SIZE: number = 50;
  CUBE_HEIGHT: number = this.CUBE_SIZE * 1.2 / 3;
  HALF_CUBE_SIZE: number = this.CUBE_SIZE / 2;
  STUD_HEIGHT: number = 10;
  STUD_WIDTH: number = 15;
  material1:any;
  constructor(color, w = 1, h = 1, d = 3, opacity = 1) {
    this.size = {
      width: this.CUBE_SIZE * w,
      height: this.CUBE_SIZE * h,
      depth: this.CUBE_HEIGHT * d,
    };

    const faceMaterial = new THREE.MeshStandardMaterial({
      color,
      opacity,
      roughness: 0.3,
      metalness: 0.90,
      // roughnessMap: this.getTexture(w, h),
      // map: this.getTexture(w / 2, h / 2),

      alphaTest: 0.2,
      side: THREE.DoubleSide
    });

    // =================================================================================================================
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(this.size.width, this.size.depth, this.size.height),
      faceMaterial
    );

    this.mesh.position.set(this.size.width / 2, this.size.depth / 2, this.size.height / 2);


    const stud = new THREE.Mesh(new THREE.CylinderGeometry(
      this.STUD_WIDTH,
      this.STUD_WIDTH,
      this.STUD_HEIGHT,
      32
    ));


    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        stud.position.y = this.size.depth / 2 + this.STUD_HEIGHT / 2;
        stud.position.x = -this.size.width / 2 + this.HALF_CUBE_SIZE + this.CUBE_SIZE * i;
        stud.position.z = this.size.height / 2 - this.HALF_CUBE_SIZE - this.CUBE_SIZE * j;
        stud.matrixAutoUpdate = false;
        stud.updateMatrix();
        // @ts-ignore
        this.mesh.geometry.merge(stud.geometry, stud.matrix);
      }
    }
  }

  // public getTexture(x, y) {
  //   return new THREE.TextureLoader().load('./assets/textures/4.png', (texture: any): void => {
  //     texture.repeat.set(x, y);
  //     texture.wrapT = THREE.RepeatWrapping;
  //     texture.wrapS = THREE.RepeatWrapping;
  //     texture.anisotropy = 4;
  //
  //
  //   });
  // }


}
