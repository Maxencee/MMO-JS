import * as THREE from "three";

export default class IdleCamera extends THREE.PerspectiveCamera {
    static fov = 35;
    static near = 1;
    static far = 300;
  
    constructor() {
      super(
        IdleCamera.fov,
        window.innerWidth / window.innerHeight,
        IdleCamera.near,
        IdleCamera.far
      );
  
      this.position.set(0, 2, 3);
      this.lookAt(new THREE.Vector3(0, 0, 0));
    }
}