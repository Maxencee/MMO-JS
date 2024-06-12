import * as THREE from "three";

export default class PlayerCamera extends THREE.PerspectiveCamera {
  static fov = 75;
  static near = 0.1;
  static far = 2000;

  constructor() {
    super(
      PlayerCamera.fov,
      window.innerWidth / window.innerHeight,
      PlayerCamera.near,
      PlayerCamera.far
    );

    this.lookAt(new THREE.Vector3(0, 0, 0));
  }

  intersect(event, group) {
    let mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this);
    return raycaster.intersectObjects(group, true);
  }
}
