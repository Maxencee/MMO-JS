import {
  Box3,
  BoxGeometry,
  Color,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from "three";

export default class BoundingBox extends Mesh {
  bounding;
  
  constructor(width, height, depth, color?) {
    let material = BoundingBox.material.clone();
    material.color = new Color(color);

    super(new BoxGeometry(width, height, depth), material);

    this.position.set(0, height / 2, 0);
  }

  static material = new MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  static setMode(mode) {
    if (mode == "solid") {
      BoundingBox.material.transparent = false;
      BoundingBox.material.opacity = 1;
      BoundingBox.material.depthWrite = true;
    }

    if (mode === "wireframe") {
      BoundingBox.material.transparent = false;
      BoundingBox.material.opacity = 1;
      BoundingBox.material.wireframe = true;
      BoundingBox.material.depthWrite = true;
    }

    if (mode === "semi-solid") {
      BoundingBox.material.transparent = true;
      BoundingBox.material.opacity = 0.65;
      BoundingBox.material.wireframe = false;
      BoundingBox.material.depthWrite = true;
    }
  }

  receiveShadow = false;
  castShadow = false;
  isCollidable = true;

  getBounding() {
    let box = new Box3().setFromObject(this);
    return box.getSize(new Vector3());
  }
}
