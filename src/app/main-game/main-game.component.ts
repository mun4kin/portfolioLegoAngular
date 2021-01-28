import {
  AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild
} from '@angular/core';
import * as THREE from 'three';

import { Lego } from './legoClass';
import { IStore } from '../_store';
import { Store } from '@ngrx/store';
import { Intersection } from 'three/src/core/Raycaster';
import { IBlock } from '../_store/types/block.type';
import { SetCurrentBlock } from '../_store/actions/block.action';
import { dino } from './dino';
import { waterT } from './texture';

declare let THREE_WATER: any;
/** Подключение JS библиотеки  с небом*/
declare let THREE_SKY: any;
/** Подключение JS библиотеки  с управлением*/
declare let THREE_ORBIT: any;
/** Замыкаем для обращения из событий*/
let that: any;

// =====================================================================================================================
@Component({
  selector: 'app-main-game',
  templateUrl: './main-game.component.html',
  styleUrls: ['./main-game.component.scss']
})


export class MainGameComponent implements AfterViewInit, OnInit {
  /** Захватываем тег для отрисовки основного контента*/
  @ViewChild('rendererContainer') rendererContainer: ElementRef;
  /** Основная сцена*/
  scene = new THREE.Scene();
  /** Объект вода*/
  water: any;
  /** Объект небо*/
  sky: any;
  /** Источник света*/
  light = new THREE.DirectionalLight(0xffffff, 2);
  /** Ограничение кубом области камеры*/
  cubeCamera = new THREE.CubeCamera(1, 50000, new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter
  }));
  /** Вектор координат мыши*/
  mouse = new THREE.Vector2();

  /** Вектор проверки пересечений*/
  raycaster = new THREE.Raycaster();
  /** Основной объект рендеринга*/
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  /** Ткущая ширина активной области*/
  WIDTH: number;
  /** Ткущая высота активной области*/
  HEIGHT: number;

  /** Библиотека управления мышью*/
  controls: any;
  /** Начальные настройки камеры*/
  cameraObj = {
    VIEW_ANGLE: 100,
    NEAR: 1,
    FAR: 180000,
    ASPECT: 8
  };
  /** Массив со всеми объектами сцены*/
  objects = [];
  /** Объект основной камеры*/
  camera: any;
  /** Кубик показывающийся при наведении*/
  rollOverMesh: any;
  /** Зажат ли шифт*/
  isShiftDown = false;
  gap: 5;
  plane: any;
  /** Дефалтные настройки кубика*/
  activeBlock:IBlock= {
    id: 0,
    iWidth: 0,
    iHeight: 0,
    sBrickColor: '',
    iCount: 0,
    isActive: true
  };
  blocks:IBlock[]=[]

  generatesBlocks(template, count, change : <T>(i:T, number) => T) {
    for (let i = 0; i < count; i++) {
      this.blocks.push( change({ ...template }, i) );
    }
  }


  // ===================================================================================================================
  constructor(private store: Store<IStore>) {
  }

  /**
   * Инициализация
   * 1.расчитываем размеры окна относительно хедера
   * 2.получаем доступные блоки
   * 3.производим комановку и настройку сцены
   *
   */
  // ===================================================================================================================
  ngOnInit(): void {


    this.WIDTH = (window.innerWidth <= 1440) ? window.innerWidth : 1440;
    this.HEIGHT = window.innerHeight;
    this.cameraObj.ASPECT = this.WIDTH / this.HEIGHT;
    that = this;
    this.store.select(state => state.blocks.activeBlock)
      .subscribe((block) => {
        let pos;
        this.activeBlock = block;

        if (this.rollOverMesh) {
          pos = this.rollOverMesh.position;
        }

        this.scene.remove(this.rollOverMesh);
        this.rollOverMesh = new Lego('#3033FF', this.activeBlock.iWidth, this.activeBlock.iHeight, 3, 0.8).mesh;
        this.rollOverMesh.position.y = -50;

        if (pos) {
          this.rollOverMesh.position.copy(pos);
        }

        this.scene.add(this.rollOverMesh);

      });


    /* --------CAMERA-------------*/
    this.camera =
      new THREE.PerspectiveCamera(
        this.cameraObj.VIEW_ANGLE,
        this.cameraObj.ASPECT,
        this.cameraObj.NEAR,
        this.cameraObj.FAR
      );
    this.camera.position.set(1200, this.WIDTH / 2 + 600, this.HEIGHT / 2 - 10);

    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);
    /* --------сетка-------------*/

    // this.scene.add( new THREE.GridHelper( 1000, 20, '#ff0000'));


    /* --------добавление невидмимого нижней грани(уровень воды)-------------*/
    const geometry = new THREE.PlaneBufferGeometry(10000, 10000);
    geometry.rotateX(-Math.PI / 2);

    this.plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));


    this.scene.add(this.plane);
    this.plane.name = 'Invisible block';
    this.objects.push(this.plane);
    /* --------Light-------------*/

    this.scene.add(this.light);
    /* -------- управление мышой-------------*/

    const controls = new THREE_ORBIT.OrbitControls(this.camera, this.renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.4;
    controls.target.set(0, 0, 0);
    controls.minDistance = 200.0;
    controls.maxDistance = 3000.0;


    this.camera.lookAt(controls.target);
    const waterGeometry = new THREE.PlaneBufferGeometry(30000, 30000);

    this.water = new THREE_WATER.Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: THREE.ImageUtils.loadTexture( waterT, undefined, (texture: any): void => {
          texture.wrapT = THREE.RepeatWrapping;
          texture.wrapS = THREE.RepeatWrapping;
        }),
        alpha: 1,
        sunDirection: this.light.position.clone()
          .normalize(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 13.7,
        fog: true
      }
    );
    this.water.rotation.x = -Math.PI / 2;
    this.scene.add(this.water);

    this.sky = new THREE_SKY.Sky();
    this.sky.scale.setScalar(30000);
    this.scene.add(this.sky);
    const uniforms = this.sky.material.uniforms;
    uniforms.turbidity.value = 20;
    uniforms.rayleigh.value = 2;
    uniforms.luminance.value = 1;
    uniforms.mieCoefficient.value = 0.005;
    uniforms.mieDirectionalG.value = 0.8;

    this.cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
    this.updateSun();

    /* -------- добавление основного блока-------------*/

    const background = new Lego('#18c118', 16, 16, 3);
    background.mesh.name = 'Main block';
    background.mesh.position.set(0, 30, 0);
    this.scene.add(background.mesh);
    this.objects.push(background.mesh);
    background.mesh['notDelete'] = true;

    dino.forEach(block => {
      const item = new Lego(block.sBrickColor, block.iWidth, block.iHeight, 3);
      item.mesh.position.set(block.x, block.y, block.z);
      that.scene.add(item.mesh);
      that.objects.push(item.mesh);
    });
    const f = (item, i) => {
      return {
        ...item,
        y: item.y + 60 * i,
        light: i === 17,
        sBrickColor: (i > 15) ? '#fdfdfd' : item.sBrickColor
      };
    };
    this.generatesBlocks( {
      iWidth: 2,
      iHeight: 2,
      sBrickColor: '#050505',
      x: 1500,
      y: 30,
      z: 0,
      light: false
    }, 18, f);
    this.generatesBlocks( {
      iWidth: 2,
      iHeight: 2,
      sBrickColor: '#000000',
      x: -1500,
      y: 30,
      z: 0,
      light: false
    }, 18, f);

    this.blocks.forEach(block => {
      const item = new Lego(block.sBrickColor, block.iWidth, block.iHeight, 3);
      item.mesh.position.set(block.x, block.y, block.z);
      this.scene.add(item.mesh);

      if (block.light) {
        const intensity = 1800;
        const width = 50;
        const height = 1320;
        const pos = block.x < 0 ? block.x + 100 : block.x - 100;
        const light = new THREE.RectAreaLight('#f3f3f3', intensity, width, height);
        light.position.set(pos, block.y, block.z);
        light.rotation.x = THREE.MathUtils.degToRad(-90);
        light.rotation.y = THREE.MathUtils.degToRad(30);
        this.scene.add(light);

      }
    });

  }


  // ===================================================================================================================
  /** Функция обновляет положение источника света */
  updateSun(): void {
    const parameters = {
      distance: 0.5,
      inclination: (22 / 0.24) * 0.012 - 0.6,
      azimuth: 0.205
    };
    const theta = Math.PI * (parameters.inclination - 0.5);
    const phi = 2 * Math.PI * (parameters.azimuth - 0.5);
    this.light.position.x = parameters.distance * Math.cos(phi);
    this.light.position.y = parameters.distance * Math.sin(phi) * Math.sin(theta);
    this.light.position.z = parameters.distance * Math.sin(phi) * Math.cos(theta);
    this.sky.material.uniforms.sunPosition.value = this.light.position.copy(this.light.position);
    this.water.material.uniforms.sunDirection.value.copy(this.light.position)
      .normalize();
    this.cubeCamera.update(this.renderer, this.scene);
  }

  // ===================================================================================================================
  /** Запускает рендеринг с учетом расчитанных до этого параметров*/
  ngAfterViewInit(): void {
    this.WIDTH = (window.innerWidth <= 1440) ? window.innerWidth : 1440;
    this.HEIGHT = window.innerHeight - document.getElementById('container')
      .getBoundingClientRect().top - 15;
    this.renderer.setClearColor('blue');
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.rendererContainer.nativeElement.addEventListener('mousemove', this.onDocumentMouseMove, false);
    this.rendererContainer.nativeElement.addEventListener('mousedown', this.onDocumentMouseDown, false);
    document.addEventListener('keydown', this.onDocumentKeyDown, false);
    document.addEventListener('keyup', this.onDocumentKeyUp, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.render(this.scene, this.camera);
    this.animate();
  }

  // ===================================================================================================================
  /** Обрабатывает евенты от мыши*/
  handleEvents(event: any, type: string): any {
    event.preventDefault();
    that.mouse.set(
      ((event.clientX - document.getElementById('container')
        .getBoundingClientRect().left) / this.WIDTH) * 2 - 1,
      -((event.clientY - document.getElementById('container')
        .getBoundingClientRect().top) / this.HEIGHT) * 2 + 1
    );
    that.raycaster.setFromCamera(that.mouse, that.camera);
    const intersects = that.raycaster.intersectObjects(that.objects);


    if (intersects.length > 0) {
      const intersect = intersects[0];

      switch (type) {
      case 'click':
        if (that.isShiftDown) {
          if (intersect.object !== that.plane && !intersect.object.notDelete) {
            that.scene.remove(intersect.object);
            that.objects.splice(that.objects.indexOf(intersect.object), 1);
          }

        } else {
          if (that.activeBlock.iCount > 0 && intersect.point.y > 20) {
            that.store.dispatch(new SetCurrentBlock({
              ...that.activeBlock,
              iCount: that.activeBlock.iCount - 1
            }));
            const voxel =
              new Lego(this.activeBlock.sBrickColor, that.activeBlock.iWidth, that.activeBlock.iHeight, 3).mesh;
            voxel.position.copy(intersect.point)
              .add(intersect.face.normal);
            this.correctMashPosition(voxel, intersect);
            voxel.name = `block @${that.objects.length}`;
            that.scene.add(voxel);
            that.objects.push(voxel);

          }
        }

        break;
      default:
        that.rollOverMesh.position.copy(intersect.point)
          .add(intersect.face.normal);
        this.correctMashPosition(that.rollOverMesh, intersect);
        break;
      }
    }

  }
  // ===============пересчет позиции блока при добавлении и присете=====================================================
  correctMashPosition(mash: THREE.Mesh, intersect: Intersection): THREE.Mesh {
    let check: boolean;
    mash.position
      .divideScalar(50)
      .floor()
      .multiplyScalar(50);

    if (this.activeBlock.id < 0) {
      mash.position.x += 25;
      mash.position.z += 25;
    }

    mash.position.y += 30;


    do {
      check = true;

      for (let i = 0; i < that.objects.length; i++) {
        // Dont test against the plane
        if (that.objects[i].geometry.type === 'PlaneBufferGeometry') {
          continue;
        }

        if (that.detectCollisionCubes(mash, that.objects[i])) {
          mash.position.y += 20;
          check = false;
        }
      }
    } while (!check || !intersect.point);

    mash.position.y -= mash.position.y % 20;
    mash.position.y += 10;

    return mash;
  }


  // ===================================================================================================================
  /** Если двигаем мышью*/
  onDocumentMouseMove(event: any): void {
    that.handleEvents(event, 'mouseMove');
  }

  // ===================================================================================================================
  /** Клик мышью*/
  onDocumentMouseDown(event: any): void {
    if (event.buttons === 1) {
      that.handleEvents(event, 'click');
    }
  }

  // ===================================================================================================================
  /** Лиссенер на изменение размера*/
  @HostListener('window:resize', ['$event'])
  /** Пересчет переменный при ресайзе*/
  onWindowResize(): void {


    this.WIDTH = (window.innerWidth <= 1440) ? window.innerWidth : 1440;
    this.HEIGHT = window.innerHeight - document.getElementById('container')
      .getBoundingClientRect().top - 15;
    this.camera.aspect = this.WIDTH / (this.HEIGHT + 275);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
  }

  // ===================================================================================================================
  /** Обрабатывает фреймы анимации*/
  animate(): void {
    window.requestAnimationFrame(() => this.animate());
    this.water.material.uniforms.time.value += 1.0 / 140.0;
    this.renderer.render(this.scene, this.camera);
  }

  // ===================================================================================================================
  /** Обработка нажатий KeyDown*/
  onDocumentKeyDown(event: any): void {
    switch (event.keyCode) {
    case 16:
      that.isShiftDown = true;
      break;
    default:
      break;
    }
  }

  // ===================================================================================================================

  /** Обработка нажатий KeyUp*/
  onDocumentKeyUp(event: any): void {
    switch (event.keyCode) {
    case 79:
      dino.forEach(block => {
        const item = new Lego(block.sBrickColor, block.iWidth, block.iHeight, 3);
        item.mesh.position.set(block.x, block.y, block.z);
        that.scene.add(item.mesh);
      });
      break;
    case 80:
      const exp = that.objects.filter(i =>
        ~i.name.indexOf('block @')).map(i => {
        return {
          iWidth: i.geometry.parameters.width / 50,
          iHeight: i.geometry.parameters.depth / 50,
          sBrickColor: new THREE.Color(i.material.color.r, i.material.color.g, i.material.color.b),
          x: i.position.x,
          y: i.position.y,
          z: i.position.z,
        };
      });
      console.warn(JSON.stringify(exp), that.objects);
      break;
    case 16:
      that.isShiftDown = false;
      break;
    case 32:
      that.store.dispatch(new SetCurrentBlock({
        ...that.activeBlock,
        iHeight: that.activeBlock.iWidth,
        iWidth: that.activeBlock.iHeight
      }));
      break;
    default:
      break;
    }
  }

  // =================================обработкапересечений объектов=====================================================
  detectCollisionCubes(object1, object2) {
    object1.geometry.computeBoundingBox();
    object2.geometry.computeBoundingBox();
    object1.updateMatrixWorld();
    object2.updateMatrixWorld();
    const gap = 11;
    const box1 = object1.geometry.boundingBox.clone();
    box1.applyMatrix4(object1.matrixWorld);
    box1.min.set(box1.min.x + gap, box1.min.y + gap, box1.min.z + gap);
    box1.max.set(box1.max.x - gap, box1.max.y - gap, box1.max.z - gap);
    const box2 = object2.geometry.boundingBox.clone();
    box2.applyMatrix4(object2.matrixWorld);
    box2.min.set(box2.min.x + gap, box2.min.y + gap, box2.min.z + gap);
    box2.max.set(box2.max.x - gap, box2.max.y - gap, box2.max.z - gap);
    const int = box1.intersectsBox(box2);
    return int;
  }

}
