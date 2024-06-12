import { BackSide, BoxGeometry, FrontSide, Mesh, MeshStandardMaterial } from "three";

export default class BoundingBoxInteractable extends Mesh {
  constructor(width, height, depth, color) {
    super(
      new BoxGeometry(width, height, depth),
      new MeshStandardMaterial({ color: color })
    );

    this.position.set(0, height/2, 0);
  }

  onCursorOver () {
    console.log("cursor over");
    let outlineMaterial = new MeshStandardMaterial({ color: 0xffffff, side: FrontSide, transparent: true, opacity: 0.5, emissive: 0xffffff, emissiveIntensity: 5.0 });
    let outlineMesh = new Mesh(this.geometry, outlineMaterial);
    // outlineMesh.scale.multiplyScalar(1.05);
    this.outline = outlineMesh;
    this.add(outlineMesh);
  }

  onCursorLeave () {
    console.log("cursor leaved");
    this.outline?.removeFromParent();
  }

  use (interactor) {
    console.log(interactor);
  }

  receiveShadow = false;
  castShadow = false;
  isCollidable = true;
  isInteractable = true;
}