import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import LightEnvironment from "../light/LightEnvironment";
import Process from "../runtime/Process";
import BoundingBox from "../props/BoundingBox";
import PropStatic from "../props/PropStatic";
import { CSS2DObject } from "three/examples/jsm/Addons";

import HolographicMaterial from "../particles/HolographicMaterial.js";
import PropDynamic from "../props/PropDynamic";

export default class Open extends THREE.Scene {
  constructor() {
    super();

    this.background = new THREE.Color(0x323232);

    BoundingBox.setMode("hidden");

    const Camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    Camera.position.set(0, 4, 0);
    Camera.lookAt(0, 4, 0);

    this.add(Camera);
    Process.setCamera(Camera);

    const LootBox = new PropStatic("assets/models/open/lootbox.fbx", {
      scale: 0.1,
      position: new THREE.Vector3(0, 2, -60),
      rotation: 0
    });

    this.add(LootBox);
    this.add(new LightEnvironment(0xfafffb, 1.5));

    const CyberCards = [];

    LootBox.onModelLoaded = () => {
      const microJump = new TWEEN.Tween(LootBox.position)
        .to({ y: LootBox.position.y + 2 }, 200)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .yoyo(true)
        .repeat(1);

      const slightRotate = new TWEEN.Tween(LootBox.rotation)
        .to({ y: LootBox.rotation.y + 0.4 }, 100)
        .easing(TWEEN.Easing.Quadratic.Out);

      const tween = new TWEEN.Tween(Camera.position)
        .to({ z: -10, x: 8 }, 2000)
        .delay(1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => Camera.lookAt(LootBox.position))
        .start();

      LootBox.model.children.forEach((child) => {
        if (child.name.includes("CyberCard")) {
          child.visible = false;

          child.loot = new PropDynamic(`assets/models/player.fbx`, {
            scale: 1,
            position: new THREE.Vector3(0, -1, -2),
            rotation: new THREE.Euler(Math.PI * 1.5, 0, 0)
          });

          child.loot.visible = false;
          child.add(child.loot);
          
          CyberCards.push(child);
        }
      });

      tween.onComplete(() => {
        /* microJump.start();
        slightRotate.start(); */
        
        const div = document.createElement('div');
        div.className = 'text-white text-4xl animate-pulse';
        div.textContent = 'Click to open';

        const openText = new CSS2DObject(div);
        openText.position.set(0, -28, 10);
        LootBox.add(openText);

        const possibleLoot = ["pistol"];

        document.addEventListener('click', function () {
          openText.removeFromParent();

          CyberCards.forEach((card, index) => {
            const jumpHeight = Math.random() * 5 + 1000;

            const offset = [34, -6, -22][index];

            card.visible = true;

            /* card.loot = new PropStatic(`assets/models/open/items/${possibleLoot[Math.floor(Math.random() * possibleLoot.length)]}.fbx`, {
              scale: 0.2,
              position: new THREE.Vector3(0, -3, -10),
              rotation: new THREE.Euler(Math.PI * 1.5, 0, 0),
              material: new HolographicMaterial({
                scanlineSize: 20,
                signalSpeed: 2,
                hologramBrightness: 0.5,
                hologramOpacity: 0.75,
                hologramColor: new THREE.Color(0x00ff00),
                enableBlinking: true
              })
            }); */
    
            const jumpUp = new TWEEN.Tween(card.position)
              .to({ y: card.position.y + jumpHeight, z: card.position.z + 300, x: card.position.x + offset }, 200)
              .easing(TWEEN.Easing.Quadratic.Out)
              .onStart(() => {
                const zoomOut = new TWEEN.Tween(Camera.position)
                  .to({ z: 25, x: 5 }, 600)
                  .delay(200)
                  .easing(TWEEN.Easing.Quadratic.Out)
                  .start();
              });
    
            const rotate = new TWEEN.Tween(card.rotation)
              .dynamic(true)
              .to({ x: card.rotation.x + Math.PI * 1.5, z: Math.PI * (offset * 0.01) }, 900)
              .easing(TWEEN.Easing.Quadratic.InOut)

            const fallDown = new TWEEN.Tween(card.position)
              .to({ y: 0, z: card.position.z + 600, x: card.position.x + offset * 10 }, 1000)
              .delay(100)
              .easing(TWEEN.Easing.Bounce.Out)
              .onComplete(() => card.loot.visible = true);
    
            jumpUp.chain(fallDown);
            rotate.start();
            jumpUp.start();
          });
        }, { once: true });
      });
    };
  }
}