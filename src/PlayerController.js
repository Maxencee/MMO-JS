import {
  BufferGeometry,
  CircleGeometry,
  Color,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  RingGeometry,
  Vector3,
} from "three";
import TWEEN from "@tweenjs/tween.js";
import BoundingBox from "./entities/BoundingBox";

export default class PlayerController {
  object;
  world;
  canMove = true;

  speed = 400;

  constructor(world) {
    this.world = world;
    this.object = new BoundingBox(1, 1.75, 1, 0x6687ff);

    const pointerMaterial = new MeshBasicMaterial({ color: 0xffffff });
    pointerMaterial.polygonOffset = true;
    pointerMaterial.polygonOffsetFactor = -0.1;

    this.pointer = new Mesh(new RingGeometry(0.45, 0.5), pointerMaterial);

    const flatPosition = new Vector3(
      this.object.position.x,
      0,
      this.object.position.z
    );

    this.pointer.rotateX(-Math.PI / 2);
    this.pointer.position.copy(flatPosition);

    const points = [flatPosition, this.pointer.position];
    const geometry = new BufferGeometry().setFromPoints(points);
    const lineMaterial = new LineBasicMaterial({
      color: 0xffffff,
      linewidth: 20,
    });
    lineMaterial.polygonOffset = true;
    lineMaterial.polygonOffsetFactor = -0.2;

    this.line = new Line(geometry);

    this.world.addToScene(this.object);
    this.world.addToScene(this.pointer);
    this.world.addToScene(this.line);

    document.addEventListener("mousedown", this.move.bind(this));
    document.addEventListener("mousemove", this.setCursor.bind(this));
  }

  move(event) {
    if (event.button !== 2 || !this.canMove) return;
    let intersects = this.world.camera.intersect(
      event,
      this.world.scene.children
    );
    let target = intersects.find((o) => o.object.isFloorable);
    if (target) {
      // event.worldTarget = target.object;
      if (this.targetPointer) this.targetPointer.removeFromParent();

      const targetM = new MeshBasicMaterial({ color: 0xffffff });
      targetM.polygonOffset = true;
      targetM.polygonOffsetFactor = -0.2;
      const targetP = new Mesh(new CircleGeometry(0.5), targetM);
      targetP.position.copy(this.pointer.position);
      targetP.rotateX(-Math.PI / 2);

      this.world.addToScene(targetP);
      this.targetPointer = targetP;

      //   MOVE

      let start = this.object.position.clone();
      let target = this.pointer.position.clone();
      target.y = start.y;

      let distance = start.distanceTo(target);
      let direction = new Vector3();
      direction.subVectors(start, target).normalize();

      if (this.tween) this.tween.stop();

      this.object.lookAt(target);

      this.tween = new TWEEN.Tween(start)
        .delay(0)
        .to(target, (distance * 1000) / (this.speed / 100))
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function (position, progress) {
          let originPoint = this.object.position.clone();
          var directionVector = new Vector3();
          directionVector.subVectors(target, start).normalize();

          var ray = new Raycaster(
            originPoint,
            directionVector.clone().normalize()
          );

          var collisionResults = ray.intersectObjects(
            this.world.getGroup("collidable"),
            true
          );
          if (
            collisionResults.length > 0 &&
            collisionResults[0].distance < directionVector.length()
          ) {
            this.object.material.color = new Color(0xf9ff47);
            this.tween.stop();
            if (this.targetPointer) this.targetPointer.removeFromParent();
          } else {
            this.object.material.color = new Color(0x4287f5);
            this.object.position.copy(position);
          }
          this.updateLine();
        }.bind(this))
        .onComplete(function () {
          if (this.targetPointer) this.targetPointer.removeFromParent();
        }.bind(this))
        .start();
    }
  }

  updateLine() {
    let start = this.object.position.clone();
    let target = this.pointer.position.clone();
    start.y = target.y;
    this.line.geometry.setFromPoints([start, target]);
  }

  setCursor(event) {
    let intersects = this.world.camera.intersect(
      event,
      this.world.scene.children
    );
    let target = intersects.find((o) => o.object.isFloorable);
    if (target) {
      let directionVector = new Vector3();
      let start = this.object.position.clone();
      directionVector.subVectors(target.point, start).normalize();

      let ray = new Raycaster(start, directionVector.clone().normalize());
      let collisionResults = ray.intersectObjects(
        this.world.getGroup("collidable"),
        true
      );

      if (collisionResults.length > 0) {
        this.line.material.color = new Color(0xff2e2e);
        this.pointer.material.color = new Color(0xff2e2e);
        this.canMove = false;
      } else {
        this.line.material.color = new Color(0xffffff);
        this.pointer.material.color = new Color(0xffffff);
        this.canMove = true;
      }

      this.pointer.position.x =
        target.point.x - (target.point.x % 1) + 0.5 * Math.sign(target.point.x);
      this.pointer.position.z =
        target.point.z - (target.point.z % 1) + 0.5 * Math.sign(target.point.z);
      this.updateLine();
    }
  }
}
