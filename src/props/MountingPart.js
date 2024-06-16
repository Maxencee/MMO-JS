import { Euler, Vector3 } from "three";
import PropDynamic from "../entities/PropDynamic";

export default class MountingPart extends PropDynamic {
  constructor(part, material) {
    super(`assets/models/mounts/${part}/scene.gltf`, {
      material: material,
      scale: new Vector3(0.95, 0.95, 0.95),
      position: new Vector3(-0.05, -0.02, 0.085),
      rotation: new Euler(),
    });
  }
}
