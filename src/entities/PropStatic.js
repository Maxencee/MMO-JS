import * as THREE from "three";
import BoundingBox from "./BoundingBox";
import { FBXLoader, GLTFLoader } from "three/examples/jsm/Addons.js";

export default class PropStatic extends BoundingBox {
  static RECEIVE_SHADOW = 2;
  static CAST_SHADOW = 1;

  model;

  constructor(model, options = null) {
    super(1, 1, 1, options.bounding);

    let material;
    
    if (options && options.texture) {
      const texture = new THREE.TextureLoader().load(options.texture);
      texture.mapping = options.mapping || THREE.UVMapping;
      texture.channel = options.channel || 0;
      material = new THREE.MeshBasicMaterial({ map: texture });
    }

    if (options && options.material) {
      material = options.material;
    }

    let mesh;
    const isFBX = model.endsWith(".fbx");
    const loader = isFBX ? new FBXLoader() : new GLTFLoader();
    loader.load(model, (model) => {
      mesh = isFBX ? model : model.scene;
      mesh.traverse((node) => {
        if (node.isMesh) {
          if (material) node.material = material;
          if (options.shadow >= PropStatic.CAST_SHADOW) node.castShadow = true;
          if (options.shadow == PropStatic.RECEIVE_SHADOW)
            node.receiveShadow = true;
        }
      });

      if (options.position) mesh.position.copy(options.position);
      if (options.scale) mesh.scale.copy(options.scale);
      if (options.rotation) mesh.rotation.copy(options.rotation);

      this.model = mesh;
      this.add(mesh);

      this.bounding = new THREE.Box3().setFromObject(mesh);
      this.size = this.bounding.getSize(new THREE.Vector3());
      this.position.y = this.size.y / 2;
      this.geometry.scale(this.size.x, this.size.y, this.size.z);

      this.onModelLoaded();
    });
  }

  onModelLoaded() {}
}
