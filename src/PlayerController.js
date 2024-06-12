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

export default class PlayerController extends BoundingBox {
  canMove = true;
  camera;

  pointer;
  target;
  line;

  speed = 400;

  constructor() {
    super(1, 1.75, 1, 0x6687ff);
  }

  isCollidable = false;

  mountCamera(camera, callback) {
    this.camera = camera;
    this.camera.getSceneChildren = callback;

    document.addEventListener("mousedown", this.moveToCursor.bind(this));
    document.addEventListener("mousemove", this.setCursor.bind(this));
  }

  addCursor(scene) {
    const pointerMaterial = new MeshBasicMaterial({ color: 0xffffff });
    pointerMaterial.polygonOffset = true;
    pointerMaterial.polygonOffsetFactor = -0.1;

    this.pointer = new Mesh(new RingGeometry(0.45, 0.5), pointerMaterial);

    const flatPosition = new Vector3(this.position.x, 0, this.position.z);

    this.pointer.rotateX(-Math.PI / 2);
    this.pointer.position.copy(flatPosition);

    const points = [flatPosition, this.pointer.position];
    const geometry = new BufferGeometry().setFromPoints(points);
    const lineMaterial = new LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
    });
    lineMaterial.polygonOffset = true;
    lineMaterial.polygonOffsetFactor = -0.2;

    this.line = new Line(geometry);

    const targetM = new MeshBasicMaterial({ color: 0xffffff });
    targetM.polygonOffset = true;
    targetM.polygonOffsetFactor = -0.2;
    this.target = new Mesh(new CircleGeometry(0.5), targetM);
    this.target.rotateX(-Math.PI / 2);
    this.target.visible = false;

    scene.add(this.pointer);
    scene.add(this.line);
    scene.add(this.target);
  }

  moveToCursor(event) {
    if (event.button !== 2 || !this.canMove) return;

    let intersects = this.camera.intersect(
      event,
      this.camera.getSceneChildren()
    );
    
    let target = intersects.find((o) => o.object.isFloorable);
    if (target) {
      // event.worldTarget = target.object;
      this.target.position.copy(this.pointer.position);
      this.target.visible = true;

      //   MOVE

      let start = this.position.clone();
      let target = this.pointer.position.clone();
      target.y = start.y;

      let distance = start.distanceTo(target);
      let direction = new Vector3();
      direction.subVectors(start, target).normalize();

      if (this.tween) this.tween.stop();

      this.lookAt(target);

      this.tween = new TWEEN.Tween(start)
        .delay(0)
        .to(target, (distance * 1000) / (this.speed / 100))
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(
          function (position, progress) {
            let originPoint = this.position.clone();
            let directionVector = new Vector3();
            directionVector.subVectors(target, start).normalize();

            let ray = new Raycaster(
              originPoint,
              directionVector.clone().normalize()
            );

            let collisionResults = ray.intersectObjects(
              this.camera.getSceneChildren(),
              true
            );

            let collidable = collisionResults.find(o => o.object.isCollidable);

            if (
              collidable &&
              collidable.distance < directionVector.length()
            ) {
              this.material.color = new Color(0xf9ff47);
              this.tween.stop();
              this.target.visible = false;
            } else {
              this.material.color = new Color(0x4287f5);
              this.position.copy(position);
              this.target.visible = true;
            }

            this.updateLine();
          }.bind(this)
        )
        .onComplete(
          function () {
            this.target.visible = false;
          }.bind(this)
        )
        .start();
    }
  }

  updateLine() {
    let start = this.position.clone();
    let target = this.pointer.position.clone();
    start.y = target.y;
    this.line.geometry.setFromPoints([start, target]);
  }

  setCursor(event) {
    let intersects = this.camera.intersect(
      event,
      this.camera.getSceneChildren()
    );

    let target = intersects.find((o) => o.object.isFloorable);
    if (target) {
      let directionVector = new Vector3();
      let start = this.position.clone();
      directionVector.subVectors(target.point, start).normalize();

      let ray = new Raycaster(start, directionVector.clone().normalize());
      let collisionResults = ray.intersectObjects(
        this.camera.getSceneChildren(),
        true
      );

      let collidable = collisionResults.find((o) => o.object.isCollidable);

      if (collidable) {
        this.line.material.color = new Color(0xff2e2e);
        this.pointer.material.color = new Color(0xff2e2e);
        this.canMove = false;
      } else {
        this.line.material.color = new Color(0xffffff);
        this.pointer.material.color = new Color(0xffffff);
        this.canMove = true;
      }

      this.pointer.position.x =
        Math.round(target.point.x)
      this.pointer.position.z =
        Math.round(target.point.z)

      this.updateLine();
    }
  }
}
