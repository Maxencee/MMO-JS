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
import PropDynamic from "./entities/PropDynamic";
import Process from "./classes/Process";

export default class PlayerController extends PropDynamic {
  canMove = true;

  pointer;
  target;
  line;

  speed = 200;

  constructor() {
    super('assets/models/player.fbx', {
      position: new Vector3(0, -0.8, 0),
      scale: new Vector3(0.032, 0.032, 0.032),
      material: new MeshBasicMaterial({ color: 0xffcaa8 }),
      shadow: PropDynamic.CAST_SHADOW
    });
  }

  onModelLoaded () {
    this.mountCamera();
    this.addCursor();

    Process.addToQueue((clock) => {
      this.mixer.update(clock.getDelta())
    });
    
    this.animations = {
      idle: this.mixer.clipAction(this.mixer.getAction("Armature|Idle")),
      walk: this.mixer.clipAction(this.mixer.getAction("Armature|Walking")),
      T: this.mixer.clipAction(this.mixer.getAction("Armature|T-Pose")),
    }

    this.animations.idle.play();
  }

  isCollidable = false;

  mountCamera() {
    document.addEventListener("mousedown", this.moveToCursor.bind(this));
    document.addEventListener("mousemove", this.setCursor.bind(this));

    Process.camera.position.x = -3;
    Process.camera.position.z = -3;
    Process.camera.position.y = 6;
    Process.camera.lookAt(this.position);
  }

  addCursor() {
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
    targetM.transparent = true;
    targetM.opacity = 0.65;

    this.target = new Mesh(new CircleGeometry(0.35), targetM);
    this.target.add(new Mesh(new RingGeometry(0.45, 0.5), targetM));

    this.target.rotateX(-Math.PI / 2);
    this.target.visible = false;

    Process.scene.add(this.pointer);
    Process.scene.add(this.line);
    Process.scene.add(this.target);
  }

  moveToCursor(event) {
    if (event.button !== 2 || !this.canMove) return;

    let intersects = Process.camera.intersect(
      event,
      Process.getSceneObjects()
    );
    
    let target = intersects.find((o) => o.object.isFloorable);
    if (target) {
      this.target.position.copy(this.pointer.position);
      this.target.visible = true;

      let start = this.position.clone();
      let target = this.pointer.position.clone();
      target.y = start.y;

      if (this.tween) this.tween.stop();

      this.lookAt(target);

      if(!this.animations.walk.isRunning()) {
        this.mixer.stopAllAction();
        this.animations.walk.play();
      }

      let distance = start.distanceTo(target);
      let direction = new Vector3();
      direction.subVectors(start, target).normalize();

      this.tween = new TWEEN.Tween(start)
        .delay(0)
        .to(target, (distance * 1000) / (this.speed / 100))
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(
          (position, progress) => {
            let [collisions, dirLength] = this.getCollisions(this.position.clone(), [start, target]);
            let collide = collisions.find(o => o.object.isCollidable);

            if (collide && collide.distance < dirLength / 2) {
              this.material.color = new Color(0xf9ff47);
              this.tween.stop();
              this.target.visible = false;

              this.mixer.stopAllAction();
              this.animations.idle.play();
            } else {
              this.material.color = new Color(0x4287f5);

              Process.camera.position.add(new Vector3(
                (position.x - this.position.x),
                0, 
                (position.z - this.position.z)
              ));

              this.position.copy(position);

              this.target.visible = true;
            }

            this.updateLine();
          }
        )
        .onComplete(
          () => {
            this.target.visible = false;
            this.mixer.stopAllAction();
            this.animations.idle.play();
          }
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
    let intersects = Process.camera.intersect(
      event,
      Process.getSceneObjects()
    );

    let target = intersects.find((o) => o.object.isFloorable);

    if (target) {
      let [collisions, dirLength] = this.getCollisions(this.position.clone(), [this.position.clone(), target.point]);
      let collide = collisions.find(o => o.object.isCollidable);

      if (collide) {
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
