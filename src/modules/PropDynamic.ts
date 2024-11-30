import * as THREE from "three";
import Prop from "./Prop";
import Process from "../runtime/Process";

export default class PropDynamic extends Prop {
  mixer;
  clock;

  currentAnimation;
  animations = {};

  isDynamic = true;

  beforeOnModelLoaded() {
    this.clock = new THREE.Clock(true);
    this.mixer = new THREE.AnimationMixer(this.model);
    
    this.mixer.getAction = (name) =>
      THREE.AnimationClip.findByName(this.model.animations, name);

    this.animations = Object.fromEntries(
      this.model.animations.map((a) => {
        return [
          a.name.split("|").pop().toLowerCase(),
          this.mixer.clipAction(this.mixer.getAction(a.name)),
        ];
      })
    );

    Process.addToQueue(() => {
      this.mixer.update(this.clock.getDelta());
    });
  }

  async playActionOnce(action, to = null) {
    let current = this.animations[to] || this.currentAnimation;

    if(!this.playAction(action)) return;

    return new Promise((resolve) => {
      this.animations[action].loop = THREE.LoopOnce;
      this.animations[action].clampWhenFinished = true;
      this.animations[action].reset().crossFadeFrom(current?.reset(), 0.25).play();
      
      setTimeout(() => {
        current?.reset().crossFadeFrom(this.animations[action], 0.25).play();
        resolve(this.animations[action]);
      }, this.animations[action].getClip().duration * 1000);
    });
  }

  playAction(action) {
    if (!this.animations || !this.animations[action])
      return console.error("Action '%s' don't exist on this prop", action);

    if (this.currentAnimation)
      this.animations[action]
        .reset()
        .crossFadeFrom(this.currentAnimation.reset(), 0.25)
        .play();

    this.currentAnimation = this.animations[action];
    return this.currentAnimation.play();
  }

  getCollisions(target = new THREE.Vector3(0, -1, 0)) {
    let direction;
    const rays = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(1, 0, 0),
    ].map((offset) => {
      let dir = new THREE.Vector3();
      dir
        .subVectors(target.clone(), this.position.clone())
        .addScaledVector(offset, 0.45)
        .normalize();
      if (!direction) direction = dir;
      return new THREE.Raycaster(this.position.clone(), dir.clone().normalize());
    });

    let objects = Process.getSceneObjects();
    objects = objects.filter((o) => o.id !== this.id && o.isCollidable);
    let collisions = rays
      .map((ray) => ray.intersectObjects(objects, true))
      .flat(2);

    return [collisions, direction.length()];
  }
}
