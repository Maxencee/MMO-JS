import * as THREE from "three";
import PropInteractable from "../entities/PropInteractable";
import TWEEN from "@tweenjs/tween.js";

export default class BoxPushable extends PropInteractable {
  constructor() {
    super("assets/models/lootbox.gltf", {
      // bounding: 0xffffff,
      // boundings: new THREE.Vector3(1, 1, 1),
      scale: new THREE.Vector3(1.5, 1.5, 1.5),
      shadow: PropInteractable.RECEIVE_SHADOW,
    });
  }

  interact(interactor) {
    if(interactor.isMoving()) return;

    let start = this.position.clone();
    const direction = new THREE.Vector3()
      .subVectors(start, interactor.position)
      .normalize()
      .round();

    if (this.tween) return;
    if(direction.x !== 0 && direction.z !== 0) return;

    let target = this.position.clone().addScaledVector(direction, 1).round();
    target.y = start.y;

    let vtarget = target.clone();
    vtarget.y = interactor.position.y;
    // let interactorTween = interactor.moveTo(target.clone().addScaledVector(direction, -1), 'kick');
    interactor.lookAt(vtarget);
    interactor.resetPointer();
    interactor.lockMovements = true;
    interactor.animations.kick.loop = THREE.LoopOnce;
    interactor.animations.kick.reset().play();

    this.interactableLeaveRange();
    // console.log(interactorTween);
    this.tween = new TWEEN.Tween(start)
      .delay(400)
      .to(target, 340)
      .easing(TWEEN.Easing.Back.Out)
      .onUpdate((position, progress) => {
        let [collisions, dirLength] = this.getCollisions(start, [
          start,
          target,
        ]);

        let collide = collisions.find((o) => o.object.isCollidable);
        
        if (collide && collide.distance < dirLength/2) {
          console.log("collide");
          console.log(collide);
          this.tween.stop();
          // interactorTween.stop();
          // interactor.target.visible = false;
          // interactor.playAction("idle");
        } else {
          this.position.copy(position);
        }
      })
      .onStart(() => this.isInteractable = false)
      .onComplete(() => {
        this.tween = null;
        this.isInteractable = true;
        interactor.lockMovements = false;
        interactor.target.position.copy(target);
      })
      .onStop(() => {
        this.tween = null;
        this.isInteractable = true;
        interactor.lockMovements = false;
        interactor.target.position.copy(target);
      })
      .start();
  }
}
