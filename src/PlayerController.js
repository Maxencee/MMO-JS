import {
  BoxGeometry,
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
import { uniform } from "three/examples/jsm/nodes/Nodes.js";

export default class PlayerController extends PropDynamic {
  pointer;
  target;
  line;
  
  speed = 200;
  isCollidable = false;
  canMove = true;

  constructor() {
    super("assets/models/player.fbx", {
      position: new Vector3(0, -0.7, 0),
      scale: new Vector3(0.008, 0.008, 0.008),
      // material: new MeshBasicMaterial({ color: 0xffcaa8 }),
      shadow: PropDynamic.CAST_SHADOW,
    });
  }

  onModelLoaded() {
    this.mountCamera();
    this.addCursor();

    Process.addToQueue(() => {
      this.mixer.update(this.clock.getDelta());
    });

    this.animations = {
      idle: this.mixer.clipAction(this.mixer.getAction("Armature|Idle")),
      walk: this.mixer.clipAction(this.mixer.getAction("Armature|Walking")),
      jump: this.mixer.clipAction(this.mixer.getAction("Armature|Jump")),
      dance: this.mixer.clipAction(
        this.mixer.getAction("Armature|Chicken Dance")
      ),
      T: this.mixer.clipAction(this.mixer.getAction("Armature|T-Pose")),
    };

    this.playAction("idle");
  }

  playAction(action) {
    if (!this.animations[action])
      return console.error("Action '%s' don't exist on this prop", action);
    this.mixer.stopAllAction();
    this.animations[action].play();
  }

  mountCamera() {
    document.addEventListener("mousedown", this.actionRightClick.bind(this));
    document.addEventListener("mousemove", this.updateCursor.bind(this));

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
    this.pointer.base = new RingGeometry(0.45, 0.5);

    const flatPosition = new Vector3(this.position.x, 0, this.position.z);

    this.pointer.rotateX(-Math.PI / 2);
    this.pointer.position.copy(flatPosition);

    const points = [flatPosition, this.pointer.position];
    const geometry = new BufferGeometry().setFromPoints(points);
    const lineMaterial = new LineBasicMaterial({
      color: 0xffffff,
      linewidth: 3,
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
    // this.target.add(new Mesh(new RingGeometry(0.45, 0.5), targetM));

    this.target.rotateX(-Math.PI / 2);
    this.target.visible = false;

    Process.scene.add(this.pointer);
    Process.scene.add(this.line);
    Process.scene.add(this.target);
  }

  actionRightClick (event) {
    if (event.button !== 2) return;

    if (this.interactableTarget) return this.interactableTarget.interact(this);
    if (!this.canMove) return;

    let start = this.position.clone();
    let target = this.pointer.position.clone();
    start.y = target.y = 0;

    // This line is super important, without it the player cast collision at 0y of itself causing non-collisions of small objects
    // took me a while to figure btw
    let vtarget = new Vector3(
      target.x,
      this.position.y,
      target.z,
    );

    if (start.equals(target)) return;
    if (this.tween) this.tween.stop();
    if (!this.animations.walk.isRunning()) this.playAction("walk");

    this.target.position.copy(this.pointer.position);
    this.target.visible = true;

    this.lookAt(vtarget);

    let distance = start.distanceTo(target);

    this.tween = new TWEEN.Tween(start)
      .delay(0)
      .to(vtarget, (distance * 1000) / (this.speed / 100))
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate((position, progress) => {
        let [collisions, dirLength] = this.getCollisions(
          start,
          [start, target]
        );

        let collide = collisions.find((o) => o.object.isCollidable);

        if (collide && collide.distance < dirLength/2) {
          this.material.color = new Color(0xf9ff47);
          this.tween.stop();
          this.target.visible = false;
          this.playAction("idle");
        } else {
          Process.camera.updatePosition(position, this.position);
          this.material.color = new Color(0x4287f5);
          this.position.x = position.x;
          this.position.z = position.z;
          this.target.visible = true;
        }

        this.updateLine();
      })
      .onComplete(() => {
        this.target.visible = false;
        this.playAction("idle");
      })
      .start();
  }

  updateLine() {
    let start = this.position.clone();
    let target = this.pointer.position.clone();
    start.y = target.y;
    this.line.geometry.setFromPoints([start, target]);
  }

  updateCursor(event) {
    let intersects = Process.camera.intersect(event);

    let interactable = intersects.find((o) => o.object.isInteractable);
    let target = intersects.find((o) => o.object.isFloorable);

    if (interactable) {
      target = interactable;
    }

    if (target) {
      this.pointer.position.x = Math.round(target.point.x);
      this.pointer.position.z = Math.round(target.point.z);
      this.updateLine();

      let [collisions, dirLength] = this.getCollisions(this.position.clone(), [
        this.position.clone(),
        this.pointer.position.clone(),
      ]);

      let collide = collisions.find((o) => o.object.isCollidable);

      if (
        collide &&
        collide.object.isInteractable &&
        collide.object.id == target.object.id
      ) {
        let bounding = target.object.getBounding();
        this.pointer.geometry = new BoxGeometry(bounding.x + 0.15, bounding.z + 0.15, 0.1);
        this.pointer.position.x = target.object.position.x;
        this.pointer.position.z = target.object.position.z;
        this.line.material.color = new Color(0xffffff);
        this.pointer.material.color = new Color(0xffffff);

        let distance = this.position.distanceTo(collide.point);
        if (distance < (target.object.interactableLength || 1)) {
          if (
            this.interactableTarget &&
            this.interactableTarget.id === target.object.id
          )
            return;
          if (
            !this.interactableTarget ||
            this.interactableTarget.id !== target.object.id
          ) {
            this.interactableTarget = target.object;
            this.interactableTarget.interactableOver();
            return;
          }
        } else {
          this.line.material.color = new Color(0xffffff);
          this.pointer.material.color = new Color(0xffffff);
          this.canMove = true;
        }
      } else if (collide) {
        this.pointer.geometry = this.pointer.base;
        this.line.material.color = new Color(0xff2e2e);
        this.pointer.material.color = new Color(0xff2e2e);
        this.canMove = false;
      } else {
        this.pointer.geometry = this.pointer.base;
        this.line.material.color = new Color(0xffffff);
        this.pointer.material.color = new Color(0xffffff);
        this.canMove = true;
      }
      
      this.interactableTarget?.interactableLeaveRange();
      this.interactableTarget = null;
    }
  }
}
