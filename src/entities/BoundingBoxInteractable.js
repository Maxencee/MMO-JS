import { FrontSide, Mesh, MeshStandardMaterial } from "three";
import BoundingBox from "./BoundingBox";

export default class BoundingBoxInteractable extends BoundingBox {
  constructor(width, height, depth, color) {
    super(width, height, depth, color);
  }

  outline;
  receiveShadow = false;
  castShadow = false;
  isInteractable = true;
  interactableLength = 1;
  
  interactableOver () {
    let outlineMaterial = new MeshStandardMaterial({ color: 0xffffff, side: FrontSide, transparent: true, opacity: 0.5, emissive: 0xffffff, emissiveIntensity: 5.0 });
    this.outline = new Mesh(this.geometry, outlineMaterial);
    this.outline.scale.multiplyScalar(1.015);
    this.add(this.outline);
  }

  interactableLeaveRange () {
    this.outline?.removeFromParent();
  }

  interact (interactor) {
    if(interactor.animations.walk.isRunning()) return;
    interactor.playAction.call(interactor, 'dance');
  }
}