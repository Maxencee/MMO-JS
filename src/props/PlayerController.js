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
      scale: new Vector3(0.0025, 0.0025, 0.0025),
      bounding: 0xffffff,
      boundings: new Vector3(0.5, 1.3, 0.5),
      // material: new MeshBasicMaterial({ color: 0xffcaa8 }),
      shadow: PropDynamic.CAST_SHADOW,
    });

    this.name = name.substr(0, 12);
  }

  loadCosmetic(cosmetic, type, options) {
    this.mountSlots[type].add(
      new PropStatic(`assets/models/cosmetics/${cosmetic}/scene.gltf`, options)
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

      if (node.name === "Head_end" && node.type === "Bone") {
        this.mountSlots.cosmeticHat = new BoundingBox(0.5, 0.5, 0.5, 0xff6a59);
        node.add(this.mountSlots.cosmeticHat);
      }

      if (node.name === "Body" && node.type === "Bone") {
        this.mountSlots.upgradeBody = new BoundingBox(0.5, 0.5, 0.5, 0xff6a59);
        node.add(this.mountSlots.upgradeBody);
      }

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

    this.pointer = new Mesh(new RingGeometry(0.45, 0.5), pointerMaterial);
    this.pointer.base = new RingGeometry(0.45, 0.5);

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

    this.target = new Mesh(new CircleGeometry(0.35), targetM);
    this.target.add(new Mesh(new RingGeometry(0.45, 0.5), targetM));

    this.target.rotateX(-Math.PI / 2);
    this.target.visible = false;

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

    this.loadCosmetic('hat', 'cosmeticHat', {
      scale: new Vector3(0.35, 0.35, 0.35),
      rotation: new Euler(0, 0, 0),
      position: new Vector3(0, -0.35, 0),
      material: this.accentMaterial
    });
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

    if (!this.canMove) return this.findPath(this.position, this.pointer.position);

    let target = this.pointer.position.clone();
    let start = this.position.clone();
    start.y = target.y = 0;

    if (start.equals(target) || this.target.position.equals(target)) return;

    this.target.position.copy(this.pointer.position);
    this.target.visible = true;

    this.moveTo(target);
  }

  moveTo(target, animation = "walk") {
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
      this.animations.walk.isRunning() ||
      this.animations.run.isRunning() ||
      this.animations.walk_tall.isRunning() ||
      this.animations.run_tall.isRunning()
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
      this.pointer.position.x = Math.round(target.point.x);
      this.pointer.position.z = Math.round(target.point.z);
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



  /// 

  findPath(start, target) {
    const path = this.flowfieldAlgorithm(start, target);
  
    // Move player along the computed path
    this.movePlayerAlongPath(path);
  }
  
  flowfieldAlgorithm(start, target) {
    // Determine the extents of the grid based on start and target positions
    const minX = Math.min(start.x, target.x);
    const maxX = Math.max(start.x, target.x);
    const minZ = Math.min(start.z, target.z);
    const maxZ = Math.max(start.z, target.z);
  
    // Calculate grid dimensions
    const gridWidth = Math.ceil(maxX) - Math.floor(minX) + 1;
    const gridHeight = Math.ceil(maxZ) - Math.floor(minZ) + 1;
  
    // Initialize the grid with all zeros (assuming all clear paths initially)
    const grid = Array.from({ length: gridWidth }, () => Array(gridHeight).fill(0));
  
    // Convert start and target positions to grid indices
    const startX = Math.floor(start.x - minX);
    const startZ = Math.floor(start.z - minZ);
    const targetX = Math.floor(target.x - minX);
    const targetZ = Math.floor(target.z - minZ);
  
    // Set obstacles (1s) at specific positions
    // Here we set a single obstacle between start and target for demonstration purposes
    const obstacleX = Math.floor((startX + targetX) / 2);
    const obstacleZ = Math.floor((startZ + targetZ) / 2);
    grid[obstacleX][obstacleZ] = 1;
  
    // Initialize distance field with Infinity
    const distanceField = Array.from({ length: gridWidth }, () => Array(gridHeight).fill(Infinity));
  
    // Define grid boundaries
    const gridMinX = 0;
    const gridMaxX = gridWidth - 1;
    const gridMinZ = 0;
    const gridMaxZ = gridHeight - 1;
  
    // Priority queue for open list
    const openList = [];
    // Closed set to keep track of visited nodes
    const closedSet = new Set();
  
    // Start point has a distance of 0
    distanceField[startX][startZ] = 0;
    openList.push({ x: startX, z: startZ });
  
    while (openList.length > 0) {
      // Extract node with smallest distance
      openList.sort((a, b) => distanceField[a.x][a.z] - distanceField[b.x][b.z]);
      const current = openList.shift();
  
      // If current node is the target, break out of loop
      if (current.x === targetX && current.z === targetZ) {
        break;
      }
  
      // Get neighbors of current node
      const neighbors = this.getNeighbors(current);
  
      neighbors.forEach((neighbor) => {
        const neighborX = neighbor.x;
        const neighborZ = neighbor.z;
  
        // Check if neighbor is within grid bounds
        if (neighborX < gridMinX || neighborX > gridMaxX || neighborZ < gridMinZ || neighborZ > gridMaxZ) {
          return; // Skip out-of-bounds neighbors
        }
  
        // Check if neighbor is an obstacle
        if (grid[neighborX][neighborZ] === 1) {
          return; // Skip obstacles
        }
  
        // Calculate tentative distance to neighbor
        const tentativeDistance = distanceField[current.x][current.z] + 1;
  
        // Update distance if shorter path found
        if (tentativeDistance < distanceField[neighborX][neighborZ]) {
          distanceField[neighborX][neighborZ] = tentativeDistance;
          openList.push({ x: neighborX, z: neighborZ });
        }
      });
  
      // Add current node to closed set
      closedSet.add(`${current.x},${current.z}`);
    }
  
    // Reconstruct path from target to start
    const path = [];
    let currentPos = { x: targetX, z: targetZ };
  
    while (!(currentPos.x === startX && currentPos.z === startZ)) {
      path.push({ x: currentPos.x, z: currentPos.z });
  
      // Find the neighbor with the lowest distance
      const neighbors = this.getNeighbors(currentPos);
      let minDistance = Infinity;
      let nextPos = null;
  
      neighbors.forEach((neighbor) => {
        const neighborX = neighbor.x;
        const neighborZ = neighbor.z;
  
        if (neighborX < gridMinX || neighborX > gridMaxX || neighborZ < gridMinZ || neighborZ > gridMaxZ) {
          return; // Skip out-of-bounds neighbors
        }
  
        if (grid[neighborX][neighborZ] === 1) {
          return; // Skip obstacles
        }
  
        if (distanceField[neighborX][neighborZ] < minDistance) {
          minDistance = distanceField[neighborX][neighborZ];
          nextPos = neighbor;
        }
      });
  
      if (!nextPos) {
        console.error('No valid next position found from:', currentPos.x, currentPos.z);
        break;
      }
  
      currentPos = nextPos;
    }
  
    // Add start position to path
    path.push({ x: startX, z: startZ });
  
    // Reverse path to get start to target order
    path.reverse();
  
    return path.map(({ x, z }) => ({ x: x + minX, z: z + minZ }));
  }
  
  getNeighbors(pos) {
    const { x, z } = pos;
    const neighbors = [
      { x: x + 1, z }, // Right
      { x: x - 1, z }, // Left
      { x, z: z + 1 }, // Up
      { x, z: z - 1 }, // Down
      { x: x + 1, z: z + 1 }, // Top-right (Diagonal)
      { x: x - 1, z: z - 1 }, // Bottom-left (Diagonal)
      { x: x + 1, z: z - 1 }, // Bottom-right (Diagonal)
      { x: x - 1, z: z + 1 }, // Top-left (Diagonal)
    ];
  
    return neighbors;
  }
  
  movePlayerAlongPath(path) {
    let index = 0;
  
    const interval = setInterval(() => {
      if (index < path.length) {
        const nextPosition = path[index];
        console.log('Moving to:', nextPosition);
  
        // Assuming playerMovementFunction moves the player to nextPosition
        this.moveTo(nextPosition);
  
        index++;
      } else {
        clearInterval(interval);
        console.log('Reached the target!');
      }
    }, 1000); // Adjust interval as needed for smooth movement
  }
}