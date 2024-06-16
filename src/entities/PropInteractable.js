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

  currentAnimation;

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

    const isFBX = path.endsWith(".fbx");
    const loader = isFBX ? new FBXLoader() : new GLTFLoader();
    loader.load(path, (model) => {
      this.model = isFBX ? model : model.scene;
      this.model.traverse((node) => {
        if (node.isMesh) {
          if (material) node.material = material;
          if (options.shadow >= PropInteractable.CAST_SHADOW) node.castShadow = true;
          if (options.shadow == PropInteractable.RECEIVE_SHADOW)
            node.receiveShadow = true;
        }
      });
      
      if (options.position) this.model.position.copy(options.position);
      if (options.rotation) this.model.rotation.copy(options.rotation);
      if (options.scale) this.model.scale.copy(options.scale);

      this.clock = new THREE.Clock(true);
      this.clock.start();
      this.mixer = new THREE.AnimationMixer(this.model);
      this.mixer.getAction = (name) =>
        THREE.AnimationClip.findByName(this.model.animations, name);

      this.model.name = path.match(/\/?(\w+)\.\w+/)[1] || "model";
      this.add(this.model);
      
      this.bounding = new THREE.Box3().setFromObject(this.model, true);
      this.size = options.boundings || this.bounding.getSize(new THREE.Vector3());
      this.position.y = this.size.y / 2;
      
      if (!options.position) this.model.position.y = -this.size.y / 2;
      
      this.geometry.scale(this.size.x, this.size.y, this.size.z);

      this.onModelLoaded();
    });
  }

  onModelLoaded() {}

  playAction(action) {
    if (!this.animations || !this.animations[action])
      return console.error("Action '%s' don't exist on this prop", action);

    if(this.currentAnimation) this.animations[action].reset().crossFadeFrom(this.currentAnimation.reset(), 0.2).play();
    this.currentAnimation = this.animations[action];
  }

  getCollisions(rayOrigin, [dirStart, dirEnd]) {
    let dir = new THREE.Vector3();
    dir.subVectors(dirEnd, dirStart).normalize();

    let ray = new THREE.Raycaster(rayOrigin.clone(), dir.clone().normalize());
    
    let objects = Process.getSceneObjects();
    objects = objects.filter(o => o.id !== this.id);
    let collisions = ray.intersectObjects(objects, true);

    return [collisions, dir.length()];
  }
}
