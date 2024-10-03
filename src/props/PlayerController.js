import {
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  Clock,
  Color,
  Euler,
  LoopOnce,
  LoopRepeat,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  RingGeometry,
  Vector3,
} from "three";

import TWEEN from "@tweenjs/tween.js";
import PropDynamic from "../entities/PropDynamic";
import Process from "../classes/Process";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "three.meshline";
import PropStatic from "../entities/PropStatic";
import BoundingBox from "../entities/BoundingBox";
import MountingPart from "../props/MountingPart";
import ParticleEngine from "../classes/ParticleEngine";
import Particles from "../entities/Particles";

export default class PlayerController extends PropDynamic {
  pointer;
  target;
  line;

  speed = 200;
  isCollidable = false;
  canMove = true;
  lockMovements = false;
  label;

  name;

  mountSlots = {};
  accentMaterial;
  accentGreyMaterial;
  bodyMaterial;
  mainMaterial;
  eyeMaterial;

  constructor(name) {
    super("assets/models/player.fbx", {
      scale: new Vector3(0.085, 0.085, 0.085),
      bounding: 0xffffff,
      boundings: new Vector3(0.5, 1.3, 0.5),
      // material: new MeshBasicMaterial({ color: 0xffcaa8 }),
      shadow: PropDynamic.CAST_SHADOW,
    });

    this.name = name.substr(0, 12);
  }

  loadCosmetic(cosmetic, type, options) {
    this.mountSlots[type].add(
      new PropStatic(`assets/models/${cosmetic}`, options)
    );
  }

  removeCosmetic(type) {
    return this.mountSlots[type].children[0]?.removeFromParent();
  }

  mountUpgrade(mount, type) {
    this.mountSlots[type].add(mount);
  }

  removeMount(type) {
    return this.mountSlots[type].children[0]?.removeFromParent();
  }

  onModelLoaded() {
    this.setupInteractions();
    this.addCursor();

    Process.addToQueue(() => {
      this.mixer.update(this.clock.getDelta());
    });

    this.animations = Object.fromEntries(
      this.model.animations.map((a) => {
        return [
          a.name.split("|")[1]?.toLowerCase() || a.name.toLowerCase(),
          this.mixer.clipAction(this.mixer.getAction(a.name)),
        ];
      })
    );
    
    console.log(this.animations);

    ["jump", "yes", "no", "death", "shoot", "pickup", "kick", "hitrecieve_1", "hitrecieve_2", "punch", "swordslash"].forEach(animation => {
      if (!this.animations[animation]) return;
      this.animations[animation].playOnce = function (currentAnimation) {
        this.loop = LoopOnce;
        this.reset().play();
        // .crossFadeFrom(currentAnimation.reset(), 0.2) | currentAnimation.reset().startAt(this.getClip().duration).play();
      }
    });

    console.log(this.animations);
    // console.log(this);

    // This add mount slots to correspondants Bones
    this.model.traverse((node) => {
      if (node.isMesh && node.name === "Leela001") {
        // We are in body of model
        node.material.forEach((material) => {
          // This is for color customisation purpose
          material.emissiveIntensity = 0.05;

          if (material.name === "Main" && material.isMaterial) {
            this.mainMaterial = material;
          }
          if (material.name === "Grey" && material.isMaterial) {
            this.bodyMaterial = material;
          }
          if (material.name === "LightGrey" && material.isMaterial) {
            this.accentGreyMaterial = material;
          }
          if (material.name === "Accent" && material.isMaterial) {
            this.accentMaterial = material;
            this.accentMaterial.emissiveIntensity = 0.35;
          }
          if (material.name === "Eye" && material.isMaterial) {
            this.eyeMaterial = material;
          }
        });
      }

      if (node.name === "mixamorig1HeadTop_End" && node.type === "Bone") {
        this.mountSlots.cosmeticHat = new BoundingBox(0.5, 0.5, 0.5, 0xff6a59);
        node.add(this.mountSlots.cosmeticHat);
      }

      if (node.name === "mixamorig1Spine" && node.type === "Bone") {
        this.mountSlots.upgradeBody = new BoundingBox(0.5, 0.5, 0.5, 0xff6a59);
        node.add(this.mountSlots.upgradeBody);
      }

      //console.log(node);

      if (node.name === "Head" && node.type === "Bone") {
        this.mountSlots.upgradeLeft = new BoundingBox(0.5, 0.5, 0.5, 0xff6a59);
        this.mountSlots.upgradeLeft.position.add(new Vector3(0.95, -0.25, 0));

        this.mountSlots.upgradeRight = new BoundingBox(0.5, 0.5, 0.5, 0xff6a59);
        this.mountSlots.upgradeRight.position.add(new Vector3(-0.95, -0.25, 0));

        this.mountSlots.upgradeEye = new BoundingBox(0.5, 0.5, 0.5, 0xff6a59);
        this.mountSlots.upgradeEye.position.add(new Vector3(0, -0.25, 0.95));
        this.mountSlots.upgradeEye.rotateX(-Math.PI / 15);

        this.mountSlots.upgradeBack = new BoundingBox(0.5, 0.5, 0.5, 0xff6a59);
        this.mountSlots.upgradeBack.position.add(new Vector3(0, -0.25, -0.95));

        this.mountSlots.upgradeHead = new BoundingBox(0.5, 0.5, 0.5, 0x6691ff);
        this.mountSlots.upgradeHead.position.add(new Vector3(0, 0, 0));

        this.eyeRayStart = new BoundingBox(0.25, 0.25, 0.25, 0xff73fa);
        this.eyeRayStart.position.add(new Vector3(0, -0.25, 0.95));
        this.eyeRayStart.rotateX(-Math.PI / 15);

        node.add(this.eyeRayStart);
        node.add(this.mountSlots.upgradeEye);
        node.add(this.mountSlots.upgradeBack);
        node.add(this.mountSlots.upgradeHead);
        node.add(this.mountSlots.upgradeLeft);
        node.add(this.mountSlots.upgradeRight);
      }
    });

    this.animations.idle.play();
    this.playAction("idle");

    let label = document.createElement("span");
    label.textContent = this.name;
    label.className = "player-name";
    this.label = new CSS2DObject(label);
    this.label.position.set(0, this.size.y + this.position.y / 2, 0);
    this.label.center.set(0.48, 0);
    this.add(this.label);

    this.actionEquipCosmetic();
  }

  setupInteractions() {
    document.addEventListener("mousedown", this.actionRightClick.bind(this));
    document.addEventListener("mousedown", this.actionLeftClick.bind(this));
    document.addEventListener("mousemove", this.updateCursor.bind(this));
    document.addEventListener("keypress", this.actionKey.bind(this));

    Process.camera.position.x = -3;
    Process.camera.position.z = -3;
    Process.camera.position.y = 6;
    Process.camera.lookAt(this.position);
  }

  addCursor() {
    const pointerMaterial = new MeshBasicMaterial({ color: 0xffffff });
    pointerMaterial.polygonOffset = true;
    pointerMaterial.polygonOffsetFactor = -0.1;

    this.pointer = new Mesh(new RingGeometry(0.2, 0.25), pointerMaterial);
    this.pointer.base = new RingGeometry(0.2, 0.25);

    const flatPosition = new Vector3(this.position.x, 0, this.position.z);

    this.pointer.rotateX(-Math.PI / 2);
    this.pointer.position.copy(flatPosition);

    const points = [flatPosition, this.pointer.position];
    const lineMaterial = new MeshLineMaterial({
      color: 0xffffff,
      lineWidth: 0.1,
      sizeAttenuation: true,
    });
    lineMaterial.polygonOffset = true;
    lineMaterial.polygonOffsetFactor = -0.2;

    const geometry = new BufferGeometry().setFromPoints(points);
    const line = new MeshLine();
    line.setGeometry(geometry);
    this.line = new Mesh(line, lineMaterial);
    this.line.raycast = MeshLineRaycast;

    const targetM = new MeshBasicMaterial({ color: 0xffffff });
    targetM.polygonOffset = true;
    targetM.polygonOffsetFactor = -0.2;
    targetM.transparent = true;
    targetM.opacity = 0.65;

    this.target = new Mesh(new CircleGeometry(0.2), targetM);
    this.target.add(new Mesh(new RingGeometry(0.2, 0.25), lineMaterial));

    this.target.rotateX(-Math.PI / 2);
    this.target.visible = false;

    const bottomCircle = new Mesh(new CircleGeometry(0.2), pointerMaterial);
    bottomCircle.rotateX(-Math.PI / 2);
    bottomCircle.position.y = -this.size.y/2;
    this.add(bottomCircle);

    Process.addToScene(this.pointer);
    Process.addToScene(this.line);
    Process.addToScene(this.target);
  }

  actionKey(event) {
    console.log(event);

    if (event.shiftKey && event.charCode >= 49 && event.charCode <= 54) {
      return this.actionEmote(event.charCode);
    }

    switch (event.keyCode) {
      case 104:
        this.actionEquipCosmetic();
        break; // H
      case 119:
        this.actionCustomiseColor();
        break; // W
      case 109:
        this.actionMountUpgrade();
        break; // M
      case 122:
        this.actionMountParticles();
        break; // Z
      default:
        break;
    }
  }

  actionMountParticles() {
    if (this.particleSystem) {
      this.particleSystem.particleMesh.removeFromParent();
    }

    this.particleSystem = new ParticleEngine();
    this.particleSystem.clock = new Clock(true);
    this.particleSystem.setValues(Particles.smoke);
    this.particleSystem.initialize();

    this.particleSystem.particleMesh.position.copy(
      this.mountSlots.upgradeBack.position
    )

    Process.addToScene(this.particleSystem.particleMesh);

    Process.addToQueue(() => {
      this.particleSystem.update(this.particleSystem.clock.getDelta() * 0.5);
      this.particleSystem.particleMesh.position.copy(this.position).add(new Vector3(0, 0.15, 0));
    });
  }

  actionMountUpgrade() {
    if (this.removeMount("upgradeHead")) return;

    this.mountUpgrade(new MountingPart('gatling', this.accentGreyMaterial), 'upgradeHead');
  }

  actionCustomiseColor() {
    console.log(this.model);
    this.mainMaterial.emissive = new Color().setHex(Math.random() * 0xffffff);
    this.bodyMaterial.emissive = new Color().setHex(Math.random() * 0xffffff);
    this.accentGreyMaterial.emissive = new Color().setHex(
      Math.random() * 0xffffff
    );
    this.accentMaterial.emissive = new Color().setHex(Math.random() * 0xffffff);
    this.eyeMaterial.color = new Color().setHex(Math.random() * 0xffffff);
  }

  actionEquipCosmetic() {
    if (this.removeCosmetic("cosmeticHat")) return;

/*     this.loadCosmetic('bucket-hat/BucketHat.gltf', 'cosmeticHat', {
      scale: new Vector3(30, 30, 30),
      rotation: new Euler(0, 0, 0),
      position: new Vector3(0, -10, -4),
      material: this.accentMaterial
    }); */
  }

  actionEmote(code) {
    let emotes = ["dance", "hello", "yes", "no", "jump", "idle"];
    let emote = emotes[code - 49];
    console.log(emote, code);
    if (
      !this.animations[emote] ||
      this.isMoving() ||
      this.animations[emote].isRunning()
    )
      return;

    this.playAction(emote);
  }

  actionLeftClick(event) {
    console.log(event);
    if (event.button !== 0) return;

    let target = this.pointer.position.clone();
    let start = this.position.clone();
    start.y = target.y = 0;

    let distance = start.distanceTo(target);

    if (distance > 1) {
      this.playAction('shoot');
    } else {
      this.playAction('swordslash');
    }
  }

  actionRightClick(event) {
    if (event.button !== 2 || this.lockMovements) return;

    if (this.interactableTarget) {
      this.interactableTarget.interact(this);
      this.interactableTarget.interactableLeaveRange();
      this.interactableTarget = null;
      this.resetPointer();
      return;
    }
    
    let target = this.pointer.position.clone();
    let start = this.position.clone();
    start.y = target.y = 0;

    if (!this.canMove) {
      return;
        // IMPLEMENT PATH FINDING TEST
        // const pathFinding = new PathFinding(this);
        // return pathFinding.findPath(start, target);
    };

    if (start.equals(target) || this.target.position.equals(target)) return;

    this.target.position.copy(this.pointer.position);
    this.target.visible = true;

    this.moveTo(target);
  }

  moveTo(target, animation = "walking") {
    if (this.tween) this.tween.stop();
    if (this.lockMovements) return;
    // this is super important, the player was casting collision at 0y of itself causing non-collisions of small objects
    // took me a while to figure btw
    // target is the raycast target while vtarget is the position target for the player
    let vtarget = new Vector3(target.x, this.position.y, target.z);
    let start = this.position.clone();
    target.y = start.y = 0;

    let direction = new Vector3().subVectors(target, start).normalize();

    let distance = start.distanceTo(target);
    let ratio = 1;

    if (distance > 7 && animation === "walk") {
      animation = "run";
      ratio = 0.55;
    }

    // Don't know if we keep it as it kinda breaks animation when spam clicking...
    // if (distance > 4.5 && animation === "walk") {
    //   animation = "walk_tall";
    //   // ratio = 0.55;
    // }

    // If the animation we are going to play is :
    // inexistant (for error handling)
    // not running
    // is fading from weight 1 <-> 0
    // = Then play the animation

    if (
      !this.animations[animation] ||
      !this.animations[animation].isRunning() ||
      (this.animations[animation].getEffectiveWeight() !== 0 && this.animations[animation].getEffectiveWeight() !== 1)
    )
      this.playAction(animation);

    let mx = new Matrix4().lookAt(
      direction,
      new Vector3(0, 0, 0),
      new Vector3(0, 1, 0)
    );

    let qt = new Quaternion().setFromRotationMatrix(mx);

    this.tween = new TWEEN.Tween(start)
      .delay(0)
      .to(vtarget, ((distance * 1000) / (this.speed / 100)) * ratio)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate((position, progress) => {
        let [collisions, dirLength] = this.getCollisions(start, [
          start,
          target,
        ]);

        let collide = collisions.find((o) => o.object.isCollidable);
        this.quaternion.slerp(qt, 0.25);

        if (collide && collide.distance <= dirLength / 2) {
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

    return this.tween;
  }

  isMoving() {
    return (
      this.animations.walking.isRunning()
    );
  }

  resetPointer() {
    this.pointer.geometry = this.pointer.base;
    this.line.material.color = new Color(0xffffff);
    this.pointer.material.color = new Color(0xffffff);
    this.updateLine();
  }

  updateLine() {
    let start = this.position.clone();
    let target = this.pointer.position.clone();
    start.y = target.y;

    const direction = new Vector3().subVectors(target, start).normalize();
    const params = this.pointer.geometry.parameters;

    const edgePoint = new Vector3(
      target.x + ((params.outerRadius || 0.25) - 0.01) * -direction.x,
      target.y,
      target.z + ((params.outerRadius || 0.25) - 0.01) * -direction.z
    );

    const geometry = new BufferGeometry().setFromPoints([start, edgePoint]);
    this.line.geometry.setGeometry(geometry);
  }

  updateCursor(event) {
    let intersects = Process.camera.intersect(event);

    let target = intersects.find((o) => o.object.isFloorable);
    let interactable = intersects.find((o) => o.object.isInteractable);

    if (interactable) {
      target = interactable;
    }

    if (target) {
      this.pointer.position.x = target.point.x;
      this.pointer.position.z = target.point.z;
      this.updateLine();

      if (this.lockMovements) {
        this.line.material.color = new Color(0xff2e2e);
        this.pointer.material.color = new Color(0xff2e2e);
        return;
      }

      let [collisions, dirLength] = this.getCollisions(this.position.clone(), [
        this.position.clone(),
        this.pointer.position.clone(),
      ]);

      let collide = collisions.find((o) => o.object.isCollidable);
      let distance = this.position.distanceTo(this.pointer.position);

      if (
        collide &&
        collide.object.isInteractable &&
        collide.object.id == target.object.id
      ) {
        let bounding = target.object.getBounding();
        this.pointer.geometry = new BoxGeometry(
          bounding.x + 0.15,
          bounding.z + 0.15,
          0.1
        );

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
            this.interactableTarget?.interactableLeaveRange();
            this.interactableTarget = target.object;
            this.interactableTarget.interactableOver();
            return;
          }
        } else {
          this.line.material.color = new Color(0xffffff);
          this.pointer.material.color = new Color(0xffffff);
          this.canMove = true;
        }
      } else if (collide && collide.distance < distance) {
        this.pointer.geometry = this.pointer.base;
        this.line.material.color = new Color(0xff2e2e);
        this.pointer.material.color = new Color(0xff2e2e);
        this.canMove = false;
      } else {
        this.resetPointer();
        this.canMove = true;
      }

      this.interactableTarget?.interactableLeaveRange();
      this.interactableTarget = null;
    }
  }
}