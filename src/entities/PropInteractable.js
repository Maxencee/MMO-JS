import * as THREE from "three";
import PropDynamic from "./PropDynamic";

export default class PropInteractable extends PropDynamic {
  outline;
  receiveShadow = false;
  castShadow = false;
  isInteractable = true;
  interactableLength = 1;
  
  interactableOver () {
    let outlineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.FrontSide, transparent: true, opacity: 0.5, emissive: 0xffffff, emissiveIntensity: 5.0 });
    this.outline = new THREE.Mesh(this.geometry, outlineMaterial);
    this.outline.scale.multiplyScalar(1.015);
    this.add(this.outline);
  }

  interactableLeaveRange () {
    this.outline?.removeFromParent();
  }

  interact (interactor) {
    if(interactor.isMoving() || interactor.animations.dance.isRunning()) return;

    interactor.playAction('dance');
  }

  constructor(path, options = null) {
    super(path, options);
  }
}
