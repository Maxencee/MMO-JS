import * as THREE from "three";
import Process from "./classes/Process";

export default class PlayerCamera extends THREE.PerspectiveCamera {
  static fov = 75;
  static near = 1;
  static far = 3000;
  static maxZoom = 7;
  static minZoom = 3;

  constructor() {
    super(
      PlayerCamera.fov,
      window.innerWidth / window.innerHeight,
      PlayerCamera.near,
      PlayerCamera.far
    );

    this.position.set(0, -1, 0);
    this.lookAt(new THREE.Vector3(0, -2, 0));
  }

  zoomTo(dir) {
    if((dir == 1 && this.position.y < PlayerCamera.minZoom) || (dir == -1 && this.position.y > PlayerCamera.maxZoom)) return;
    this.updatePosition(
      new THREE.Vector3(0.3 * dir, 0, 0.3 * dir),
      new THREE.Vector3(0.1 * dir, 0, 0.1 * dir)
    );
    this.position.y += 0.35 * -dir;
  }

  updatePosition(position, playerPosition) {
    this.position.add(
      new THREE.Vector3(
        position.x - playerPosition.x,
        0,
        position.z - playerPosition.z
      )
    );
    this.updateMatrixWorld();
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
