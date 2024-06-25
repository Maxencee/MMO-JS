import PropDynamic from "../entities/PropDynamic";
import BoundingBox from "../entities/BoundingBox";
import { LoopOnce, Vector3 } from "three";
import Process from "../classes/Process";

export default class PlayerStatic extends PropDynamic {
  accentMaterial;
  accentGreyMaterial;
  bodyMaterial;
  mainMaterial;
  eyeMaterial;
  
  mountSlots = {};

  constructor() {
    super("assets/models/player.fbx", {
      scale: new Vector3(0.0025, 0.0025, 0.0025),
      bounding: 0xffffff,
      boundings: new Vector3(0.5, 1.3, 0.5),
      // material: new MeshBasicMaterial({ color: 0xffcaa8 }),
      shadow: PropDynamic.CAST_SHADOW,
    });
  }

  onModelLoaded() {
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
    // console.log(this);
    ["jump", "yes", "no", "shoot", "punch"].forEach(animation => {
        if(!this.animations[animation]) return;
        this.animations[animation].playOnce = function () {
          this.loop = LoopOnce;
          this.reset().play();
        }
    });  

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
  }
}
