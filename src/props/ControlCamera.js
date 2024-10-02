import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Process from "../classes/Process";
import UI from "../classes/UI";

export default class ControlCamera extends THREE.PerspectiveCamera {
  static fov = 35;
  static near = 1;
  static far = 300;

  constructor() {
    super(
      ControlCamera.fov,
      window.innerWidth / window.innerHeight,
      ControlCamera.near,
      ControlCamera.far
    );

    this.position.set(0, 2, 3);
    this.lookAt(new THREE.Vector3(0, 0, 0));

    this.controls = new OrbitControls(this, UI.renderers);
    this.controls.dampingFactor = 0.05;

    this.controls.screenSpacePanning = false;

    this.controls.minDistance = 5;
    this.controls.maxDistance = 100;

    this.controls.maxPolarAngle = Math.PI / 2;
  }
}
