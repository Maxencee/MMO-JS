import * as THREE from "three";
import Process from "../runtime/Process";

export default class PlayerCamera extends THREE.PerspectiveCamera {
  static fov = 75;
  static near = 2; // for the camera to be able to see the player through the trees and other objects obstructing the view
  static far = 3000;

  constructor() {
    super(
      PlayerCamera.fov,
      window.innerWidth / window.innerHeight,
      PlayerCamera.near,
      PlayerCamera.far
    );
  }

  intersect(event) {
    let mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this);
    return raycaster.intersectObjects(Process.getSceneObjects(), true);
  }
}
