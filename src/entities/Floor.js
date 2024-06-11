import { AxesHelper, BoxGeometry, GridHelper, Mesh, MeshStandardMaterial } from "three";

export default class Floor extends Mesh {
  constructor() {
    super(
      new BoxGeometry(30, 1, 30),
      new MeshStandardMaterial({ color: 0x717171 })
    );

    const axesHelper = new AxesHelper(5);
    axesHelper.position.y = 0.51;
    this.add(axesHelper);

    const gridHelper = new GridHelper(30, 30, 0x333333);
    gridHelper.position.y = 0.509;
    this.add(gridHelper);

    this.receiveShadow = true;
    this.position.set(0, -0.5, 0);

    this.isFloorable = true;
  }
}
