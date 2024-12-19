import * as THREE from "three";
import BoundingBox from "./BoundingBox";
import { FBXLoader, GLTFLoader, OBJLoader } from "three/examples/jsm/Addons.js";

type PropOptions =  {
  position?: THREE.Vector3,
  rotation?: THREE.Euler | number,
  scale?: THREE.Vector3 | number,
  shadow?: number,
  bounding?: number,
  boundings?: THREE.Vector3,
  texture?: string,
  mapping?: THREE.Mapping,
  channel?: number,
  material?: THREE.Material
};

export default class Prop extends BoundingBox {
  static RECEIVE_SHADOW : number = 2;
  static CAST_SHADOW : number = 1;

  model : THREE.Object3D;
  size : THREE.Vector3;
  
  constructor(path : string, options : PropOptions = {
    position: new THREE.Vector3(0, 0, 0),
    rotation: 0,
    scale: 1,
    shadow: Prop.RECEIVE_SHADOW,
    bounding: 0x00000,
    boundings: new THREE.Vector3(1, 1, 1),
    texture: null,
    mapping: THREE.UVMapping,
    channel: 0,
    material: null
  }) {
    super(1, 1, 1, options.bounding);

    let material : THREE.Material;
    
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
    const isOBJ = path.endsWith(".obj");
    const loader = isFBX ? new FBXLoader() : (isOBJ ? new OBJLoader() : new GLTFLoader());
    loader.load(path, (model) => {
      this.model = (isFBX || isOBJ) ? model : model.scene;
      this.model.traverse(function (node : THREE.Object3D) {
        if (node instanceof THREE.Mesh) {
          if (material) node.material = material;
          if (options.shadow >= Prop.CAST_SHADOW) node.castShadow = true;
          if (options.shadow == Prop.RECEIVE_SHADOW)
            node.receiveShadow = true;
        }
      });
      
      if (options.position) this.position.copy(options.position);
      if (options.rotation && !(options.rotation instanceof THREE.Euler)) options.rotation = (new THREE.Euler(0, options.rotation, 0));
      if (options.rotation && options.rotation instanceof THREE.Euler) this.rotation.copy(options.rotation);
      if (options.scale && !(options.scale instanceof THREE.Vector3)) options.scale = (new THREE.Vector3(1, 1, 1)).multiplyScalar(options.scale);
      if (options.scale && options.scale instanceof THREE.Vector3) this.model.scale.copy(options.scale);

      this.model.name = path.match(/\/?(\w+)\.\w+/)[1] || "model";
      this.add(this.model);
      
      this.bounding = new THREE.Box3().setFromObject(this.model, true);
      this.size = options.boundings || this.bounding.getSize(new THREE.Vector3());
      
      if(!options.position || !options.position.y) this.position.y = this.size.y/2;
      this.model.position.y = -this.size.y/2;
      
      this.geometry.scale(this.size.x, this.size.y, this.size.z);

      this.beforeOnModelLoaded();
      this.onModelLoaded();
    });
  }

  beforeOnModelLoaded() {}
  onModelLoaded() {}
}
