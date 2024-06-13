import { Box3, BoxGeometry, Mesh, MeshStandardMaterial, Vector3 } from "three";

export default class BoundingBox extends Mesh {
  constructor(width, height, depth, color) {
    super(
      new BoxGeometry(width, height, depth),
      new MeshStandardMaterial({ color: color, wireframe: true })
    );

    if(!color) {
      this.material.transparent = true;
      this.material.opacity = 0;
    }

    this.position.set(0, height/2, 0);
  }

  receiveShadow = false;
  castShadow = false;
  isCollidable = true;

  getBounding () {
    let box = new Box3().setFromObject(this);
    return box.getSize(new Vector3());
  }
}
