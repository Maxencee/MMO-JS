import * as THREE from "three";
import { FBXLoader, GLTFLoader } from "three/examples/jsm/Addons.js";
import Process from "../classes/Process";
import BoundingBoxInteractable from "./BoundingBoxInteractable";

export default class PropInteractable extends BoundingBoxInteractable {
  static RECEIVE_SHADOW = 2;
  static CAST_SHADOW = 1;

  mixer;
  model;
  clock;

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
          if (options.shadow >= PropInteractable.CAST_SHADOW) node.castShadow = true;
          if (options.shadow == PropInteractable.RECEIVE_SHADOW)
            node.receiveShadow = true;
        }
      });

      if (options.position) mesh.position.copy(options.position);
      if (options.scale) mesh.scale.copy(options.scale);
      if (options.rotation) mesh.rotation.copy(options.rotation);

      this.clock = new THREE.Clock(true);
      this.clock.start();
      this.mixer = new THREE.AnimationMixer(mesh);
      this.mixer.getAction = (name) =>
        THREE.AnimationClip.findByName(mesh.animations, name);

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

  getCollisions(rayOrigin, [dirStart, dirEnd]) {
    let dir = new THREE.Vector3();
    dir.subVectors(dirEnd, dirStart).normalize();

    let ray = new THREE.Raycaster(rayOrigin.clone(), dir.clone().normalize());
    let collisions = ray.intersectObjects(Process.getSceneObjects(), true);

    return [collisions, dir.length()];
  }
}
