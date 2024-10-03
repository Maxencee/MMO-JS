import * as THREE from "three";
import Process from "../classes/Process";
import Prop from "./Prop";

export default class PropDynamic extends Prop {
  mixer;
  clock;

  animations;
  currentAnimation;

  constructor(path, options = null) {
    super(path, options);
  }

  beforeOnModelLoaded() {
    this.clock = new THREE.Clock(true);
    this.clock.start();
    this.mixer = new THREE.AnimationMixer(this.model);
    this.mixer.getAction = (name) =>
      THREE.AnimationClip.findByName(this.model.animations, name);
  }

  playAction(action) {
    if (!this.animations || !this.animations[action])
      return console.error("Action '%s' don't exist on this prop", action);

    if (this.animations[action].playOnce)
      return this.animations[action].playOnce();
    if (this.currentAnimation)
      this.animations[action]
        .reset()
        .crossFadeFrom(this.currentAnimation.reset(), 0.2)
        .play();
    this.currentAnimation = this.animations[action];
  }

  getCollisions(rayOrigin, [dirStart, dirEnd]) {
    let direction;
    const rays = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(1, 0, 0),
    ].map((offset) => {
      let dir = new THREE.Vector3();
      dir
        .subVectors(dirEnd, dirStart)
        .addScaledVector(offset, 0.45)
        .normalize();
      if (!direction) direction = dir;
      return new THREE.Raycaster(rayOrigin.clone(), dir.clone().normalize());
    });

    let objects = Process.getSceneObjects();
    objects = objects.filter((o) => o.id !== this.id && o.isCollidable);
    let collisions = rays
      .map((ray) => ray.intersectObjects(objects, true))
      .flat(2);

    return [collisions, direction.length()];
  }
}
