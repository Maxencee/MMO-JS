import * as THREE from "three";
import BoundingBox from "./BoundingBox";
import { FBXLoader, GLTFLoader } from "three/examples/jsm/Addons.js";

export default class Prop extends BoundingBox {
  static RECEIVE_SHADOW = 2;
  static CAST_SHADOW = 1;

  model;
  
  constructor(path, options = null) {
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

    if(path == null) return;

    const isFBX = path.endsWith(".fbx");
    const loader = isFBX ? new FBXLoader() : new GLTFLoader();
    loader.load(path, (model) => {
      this.model = isFBX ? model : model.scene;
      this.model.traverse((node) => {
        if (node.isMesh) {
          if (material) node.material = material;
          if (options.shadow >= Prop.CAST_SHADOW) node.castShadow = true;
          if (options.shadow == Prop.RECEIVE_SHADOW)
            node.receiveShadow = true;
        }
      });
      
      if (options.position) this.model.position.copy(options.position);
      if (options.rotation) this.model.rotation.copy(options.rotation);
      if (options.scale) this.model.scale.copy(options.scale);

      this.model.name = path.match(/\/?(\w+)\.\w+/)[1] || "model";
      this.add(this.model);
      
      this.bounding = new THREE.Box3().setFromObject(this.model, true);
      this.size = options.boundings || this.bounding.getSize(new THREE.Vector3());
      this.position.y = this.size.y / 2;
      
      if (!options.position || !options.position.y) this.model.position.y = -this.size.y / 2;
      
      this.geometry.scale(this.size.x, this.size.y, this.size.z);

      this.beforeOnModelLoaded();
      this.onModelLoaded();
    });
  }

  beforeOnModelLoaded() {}
  onModelLoaded() {}
}
