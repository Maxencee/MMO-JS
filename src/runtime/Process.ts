import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { CSS2DRenderer } from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import UI from "./UI";

export default class Process {
  renderer;
  renderer2D;
  renderID;

  static element;
  static scene;
  static camera;
  static clock;
  static lod;

  static stats;
  static queue = [];

  constructor () {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.frustumCulled = true;
    this.renderer.gammaOutput = true;
    this.renderer.gammaFactor = 1.2;
    this.renderer.alpha = true;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    UI.init();
    UI.renderers.appendChild(this.renderer.domElement);

    this.renderer2D = new CSS2DRenderer();
    this.renderer2D.setSize(window.innerWidth, window.innerHeight);
    this.renderer2D.domElement.classList.add("renderer2D");
    UI.renderers.appendChild(this.renderer2D.domElement);

    Process.lod = new THREE.LOD();
    Process.clock = new THREE.Clock(true);
    Process.element = this.renderer.domElement;
  }

  static getSceneObjects() {
    return Process.scene.children;
  }

  static addToQueue(callback) {
    Process.queue.push(callback);
  }

  static addToScene(object) {
    if (Process.scene) {
      Process.scene.add(object);
    } else {
      console.error("No current scene");
    }
  }

  static setScene (scene) {
    Process.scene = scene;
  }

  static setCamera (camera) {
    Process.camera = camera;
  }

  static showStats () {
    if(Process.stats) return;
    Process.stats = new Stats();
    Process.stats.domElement.style.position = "absolute";
    Process.stats.domElement.style.bottom = "0px";
    Process.stats.domElement.style.left = "0px";
    Process.stats.domElement.style.height = "0px";
    Process.stats.domElement.style.zIndex = 100;
    document.body.appendChild(Process.stats.domElement);
  }

  render() {
    if (!Process.scene || !Process.camera) {
      return;
      cancelAnimationFrame(Process.renderID);
      return console.error("Scene or Camera unloaded");
    }

    TWEEN.update();
    
    if(Process.queue.length > 0) Process.queue.filter((callback) => callback(Process.clock.getDelta()) !== false);

    this.renderer.render(Process.scene, Process.camera);
    this.renderer2D.render(Process.scene, Process.camera);
    this.renderID = requestAnimationFrame(() => this.render());

    Process.stats?.update();
  }
}
