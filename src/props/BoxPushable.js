import * as THREE from "three";
import PropInteractable from "../entities/PropInteractable";
import TWEEN from "@tweenjs/tween.js";

export default class BoxPushable extends PropInteractable {
  constructor() {
    super("assets/models/crates/crate.gltf", {
      // bounding: 0xffffff,
      scale: new THREE.Vector3(1.5, 1.5, 1.5),
      position: new THREE.Vector3(0, -0.4, 0),
      shadow: PropInteractable.RECEIVE_SHADOW,
    });

    this.position.set(-3, 0, 4);
  }

  interact(interactor) {
    let start = this.position.clone();
    const direction = new THREE.Vector3()
      .subVectors(start, interactor.position)
      .normalize()
      .round();
    if (this.tween || (direction.x !== 0 && direction.z !== 0)) return;
    let target = this.position.clone().addScaledVector(direction, 1);
    target.y = start.y;

    let interactorTween = interactor.moveTo(target.clone().addScaledVector(direction, -1), 'push');
    console.log(interactorTween);

    this.tween = new TWEEN.Tween(start)
      .delay(0)
      .to(target, interactorTween.getDuration() / 1.4)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate((position, progress) => {
        let [collisions, dirLength] = this.getCollisions(start, [
          start,
          target,
        ]);

        let collide = collisions.find((o) => o.object.isCollidable);
        
        if (collide && collide.distance < dirLength/2) {
          console.log("collide");
          this.tween.stop();
          interactorTween.stop();
          interactor.target.visible = false;
          interactor.playAction("idle");
        } else {
          this.position.copy(position);
        }
      })
      .onComplete(() => {
        this.tween = null;
      })
      .onStop(() => {
        this.tween = null;
      })
      .start();
  }
}
