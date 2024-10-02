import { AxesHelper, BoxGeometry, Color, Euler, GridHelper, Mesh, MeshStandardMaterial, Vector3 } from "three";
import BoundingBox from "../entities/BoundingBox";
import PropStatic from "../entities/PropStatic";

export default class Floor extends Mesh {
  isFloorable = true;
  receiveShadow = true;
  isCollidable = false;
  
  constructor() {
    super(
      new BoxGeometry(25, 1, 25),
      new MeshStandardMaterial({
        color: 0x1b1b1b
      })
    );

    this.position.set(0, -0.5, 0);

    const axesHelper = new AxesHelper(5);
    axesHelper.position.y = 0.501;
    this.add(axesHelper);

    const gridHelper = new GridHelper(25, 100, 0xeb4034);
    gridHelper.position.y = 0.5;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.polygonOffset = true;
    gridHelper.material.polygonOffsetFactor = -0.1;
    this.add(gridHelper);
    
    // added walls
    
    const xwall = new BoundingBox(1, 5, 25, 0xb7ff78);
    const ywall = new BoundingBox(25, 5, 1, 0xb7bf78);

    let wx1 = xwall.clone();
    wx1.position.set(13, 2.5, 0);
    this.add(wx1);

    let wx2 = xwall.clone();
    wx2.position.set(-13, 2.5, 0);
    this.add(wx2);

    let wy1 = ywall.clone();
    wy1.position.set(0, 2.5, 13);
    this.add(wy1);

    let wy2 = ywall.clone();
    wy2.position.set(0, 2.5, -13);
    this.add(wy2);
  }
}
