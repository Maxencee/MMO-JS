import * as THREE from "three";
import UI from "../runtime/UI";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export default class ControlCamera extends THREE.PerspectiveCamera {
  static fov = 35;
  static near = 1;
  static far = 300;

  static position = new THREE.Vector3(0, 2, 5);
  static lookAt = new THREE.Vector3(0, 0, 0);

  static dampingFactor = 0.05;
  static minDistance = 5;
  static maxDistance = 100;
  static maxPolarAngle = Math.PI / 2;
  static screenSpacePanning = false;

  private controls: OrbitControls;

  constructor(from = ControlCamera) {
    super(
      from.fov,
      window.innerWidth / window.innerHeight,
      from.near,
      from.far
    );

    this.position.copy(from.position);
    this.lookAt(from.lookAt);

    this.controls = new OrbitControls(this, UI.renderers);
    this.controls.dampingFactor = from.dampingFactor;

    this.controls.screenSpacePanning = from.screenSpacePanning;

    this.controls.minDistance = from.minDistance;
    this.controls.maxDistance = from.maxDistance;

    this.controls.maxPolarAngle = from.maxPolarAngle;
  }
}
