import { BoxGeometry, Mesh, MeshStandardMaterial } from "three";

export default class BoundingBox extends Mesh {
  constructor(width, height, depth, color) {
    super(
      new BoxGeometry(width, height, depth),
      new MeshStandardMaterial({ color: color, wireframe: true })
    );

    this.position.set(0, height/2, 0);
  }

  receiveShadow = true;
  castShadow = true;
  isCollidable = true;
}
