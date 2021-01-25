import {
  AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild
} from '@angular/core';
import * as THREE from 'three';

import { Lego } from './legoClass';
import { IStore } from '../_store';
import { Store } from '@ngrx/store';


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
  // /** Захватываем тег для отрисовки хедера*/
  // @ViewChild('header1') header1: ElementRef;
  /** Основная сцена*/
  scene = new THREE.Scene();
  /** Объект вода*/
  water: any;
  /** Объект небо*/
  sky: any;
  /** Источник света*/
  light = new THREE.DirectionalLight(0xffffff, 0.8);


  /** Ограничение кубом области камеры*/

  cubeCamera = new THREE.CubeCamera(1, 20000, new THREE.WebGLCubeRenderTarget( 256, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter
  } ));
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
    FAR: 70000,
    ASPECT: 7
  };
  /** Массив со всеми объектами сцены*/
  objects = [];
  /** Объект основной камеры*/
  camera: any;
  /** Кубик показывающийся при наведении*/
  rollOverMesh: any;
  /** Зажат ли шифт*/
  isShiftDown = false;
  plane: any;
  /** Дефалтные настройки кубика*/
  activeBlock = {
    iWidth: 0,
    iHeight: 0,
    sName: '0*0',
    iCount: 0,
    isActive: true
  };
  /** Открыта ли консоль*/
  showPrompt = false;
  /** Цвет по умолчанию*/
  brickColor = '#e53935';
  // ===================================================================================================================
  constructor(private store: Store<IStore>) {}
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
    this.store.select(state => state.blocks.blocks.find(i => i.isActive)).subscribe((block) => {

      let pos;
      this.activeBlock = block;

      if (this.rollOverMesh) {
        pos = this.rollOverMesh.position;
      }

      this.scene.remove(this.rollOverMesh);
      this.rollOverMesh = new Lego('#3033FF', this.activeBlock.iWidth, this.activeBlock.iHeight, 3, 0.8).mesh;

      if (pos) {
        this.rollOverMesh.position.copy(pos);
      }

      this.scene.add(this.rollOverMesh);

    });
    /*
     * Проверка оставшихся блоков и синхронизация с html
     * this.dataTransferLib.getObserver('activeBlock').subscribe(block => {
     *   if (block !== 0) {
     *     let pos;
     *     this.activeBlock = block;
     *
     *     if (this.rollOverMesh) {
     *       pos = this.rollOverMesh.position;
     *     }
     *
     *     this.scene.remove(this.rollOverMesh);
     *     this.rollOverMesh = new Lego('#3033FF', this.activeBlock.iWidth, this.activeBlock.iHeight, 3, 0.8).mesh;
     *
     *     if (pos) {
     *       this.rollOverMesh.position.copy(pos);
     *     }
     *
     *     this.scene.add(this.rollOverMesh);
     *   }
     *
     * });
     */

    /* --------CAMERA-------------*/
    this.camera =
      new THREE.PerspectiveCamera(
        this.cameraObj.VIEW_ANGLE,
        this.cameraObj.ASPECT,
        this.cameraObj.NEAR,
        this.cameraObj.FAR
      );
    this.camera.position.set(0, this.WIDTH / 2, this.HEIGHT / 2);
    this.camera.rotation.set(0.4757187465676117, 0.19695168595361062, 0.10047167511790238);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);
    /* --------сетка-------------*/

    // Const gridHelper = new THREE.GridHelper(1000, 20);
    /* --------добавление невидмимого блока хз для чего-------------*/
    const geometry = new THREE.PlaneBufferGeometry(1000, 1000);
    geometry.rotateX(-Math.PI / 2);
    this.plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    this.scene.add(this.plane);
    this.objects.push(this.plane);
    /* --------Light-------------*/

    this.scene.add(this.light);
    /* -------- управление мышой-------------*/

    const controls = new THREE_ORBIT.OrbitControls(this.camera, this.renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.4;
    controls.target.set(0, 10, 0);
    controls.minDistance = 200.0;
    controls.maxDistance = 1000.0;
    this.camera.lookAt(controls.target);
    const waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000);
    const image = document.createElement('img');
    const roughnessMap = new THREE.Texture(image);

    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;

    this.water = new THREE_WATER.Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('../assets/textures/waternormals.jpg', (texture: any): void => {

          texture.wrapT = THREE.RepeatWrapping;
          texture.wrapS = THREE.RepeatWrapping;
        }),
        alpha: 1.0,
        sunDirection: this.light.position.clone().normalize(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: this.scene.fog !== undefined
      }
    );
    this.water.rotation.x = -Math.PI / 2;
    this.scene.add(this.water);
    this.sky = new THREE_SKY.Sky();
    this.sky.scale.setScalar(10000);
    this.scene.add(this.sky);
    const uniforms = this.sky.material.uniforms;
    uniforms.turbidity.value = 10;
    uniforms.rayleigh.value = 2;
    uniforms.luminance.value = 1;
    uniforms.mieCoefficient.value = 0.005;
    uniforms.mieDirectionalG.value = 0.8;

    this.cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
    this.updateSun();
    /*
     * Const pointLight = new THREE.PointLight('#858887', 2);
     * pointLight.position.x = 200;
     * pointLight.position.y = 100;
     * pointLight.position.z = 200;
     * this.scene.add(pointLight);
     */


    /* -------- добавление основного блока-------------*/

    const background = new Lego('#5fac5c', 20, 20, 3);
    background.mesh.position.divideScalar(25).floor().multiplyScalar(25)
      .addScalar(15);
    this.scene.add(background.mesh);
    this.objects.push(background.mesh);
    background.mesh['notDelete'] = true;
  }
  // ===================================================================================================================
  /** Функция обновляет положение источника света */
  updateSun(): void {
    const date = new Date();
    const parameters = {
      distance: 0.5,
      inclination: (date.getHours() / 0.24) * 0.012 - 0.6, //  Зависимости от часа солнце светит по разному
      azimuth: 0.205
    };
    const theta = Math.PI * (parameters.inclination - 0.5);
    const phi = 2 * Math.PI * (parameters.azimuth - 0.5);
    this.light.position.x = parameters.distance * Math.cos(phi);
    this.light.position.y = parameters.distance * Math.sin(phi) * Math.sin(theta);
    this.light.position.z = parameters.distance * Math.sin(phi) * Math.cos(theta);
    this.sky.material.uniforms.sunPosition.value = this.light.position.copy(this.light.position);
    this.water.material.uniforms.sunDirection.value.copy(this.light.position).normalize();
    this.cubeCamera.update(this.renderer, this.scene);
  }
  // ===================================================================================================================
  /** Запускает рендеринг с учетом расчитанных до этого параметров*/
  ngAfterViewInit(): void {
    this.WIDTH = (window.innerWidth <= 1440) ? window.innerWidth : 1440;
    this.HEIGHT = window.innerHeight - document.getElementById('container').getBoundingClientRect().top - 5;
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
    that.mouse.set(((event.clientX - document.getElementById('container').getBoundingClientRect().left) / this.WIDTH) * 2 - 1, -((event.clientY - document.getElementById('container').getBoundingClientRect().top) / this.HEIGHT) * 2 + 1);
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
          // Create cube
        } else {

          if (that.activeBlock.iCount > 0 && intersect.point.y > 20) {
            /*
             * That.activeBlock.iCount -= 1;
             * This.dataTransferLib.setObserver('activeBlock', that.activeBlock);
             */
            const voxel = new Lego(this.brickColor, that.activeBlock.iWidth, that.activeBlock.iHeight, 3).mesh;
            voxel.position.copy(intersect.point).add(intersect.face.normal);
            voxel.position.divideScalar(25).floor().multiplyScalar(25)
              .addScalar(15);
            that.scene.add(voxel);
            that.objects.push(voxel);
          }
        }

        break;
      default:
        that.rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
        that.rollOverMesh.position.divideScalar(25).floor().multiplyScalar(25)
          .addScalar(15);
        break;
      }
    }

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
    this.HEIGHT = window.innerHeight - document.getElementById('container').getBoundingClientRect().top - 5;
    this.camera.aspect = this.WIDTH / this.HEIGHT;
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
    case 16:
      that.isShiftDown = false;
      break;
    case 39:
      /*
       * Let curentHeight = that.activeBlock.iHeight;
       * that.activeBlock.iHeight = that.activeBlock.iWidth;
       * that.activeBlock.iWidth = curentHeight;
       */

      // This.dataTransferLib.setObserver('activeBlock', that.activeBlock);
      break;
    default:
      break;
    }
  }
  // ===================================================================================================================
  /** Открывает консоль читкодов*/
  onShowPrompt(e: any): void {
    if (e.ctrlKey && e.keyCode === 192) {
      this.showPrompt = !this.showPrompt;
    }
  }

}
