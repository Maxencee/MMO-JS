import { AxesHelper, BoxGeometry, GridHelper, Mesh, MeshStandardMaterial } from "three";

export default class Floor extends Mesh {
  isFloorable = true;
  receiveShadow = true;
  
  constructor() {
    super(
      new BoxGeometry(25, 1, 25),
      new MeshStandardMaterial({ color: 0x717171 })
    );

    const axesHelper = new AxesHelper(5);
    axesHelper.position.y = 0.502;
    this.add(axesHelper);

    const gridHelper = new GridHelper(25, 25, 0x333333);
    gridHelper.position.y = 0.501;
    this.add(gridHelper);

    this.position.set(0, -0.5, 0);
  }
}
