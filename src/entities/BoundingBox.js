import { BoxGeometry, Mesh, MeshStandardMaterial } from "three";

export default class BoundingBox extends Mesh {
  constructor(width, height, depth, color) {
    super(
      new BoxGeometry(width, height, depth),
      new MeshStandardMaterial({ color: color, wireframe: true })
    );

    this.receiveShadow = true;
    this.castShadow = true;
    this.position.set(0.5, height/2, 0.5);

    this.isCollidable = true;
  }
}
