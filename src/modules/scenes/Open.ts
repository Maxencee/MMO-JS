import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import LightEnvironment from "../light/LightEnvironment";
import Process from "../runtime/Process";
import BoundingBox from "../props/BoundingBox";
import PropStatic from "../props/PropStatic";

import HolographicMaterial from "../particles/HolographicMaterial.js";

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

    Camera.position.set(0, 4, 10);
    Camera.lookAt(0, 4, 0);

    this.add(Camera);
    Process.setCamera(Camera);

    const LootBox = new PropStatic("assets/models/open/lootbox.fbx", {
      scale: 0.1,
      position: new THREE.Vector3(0, 0, 0),
      rotation: Math.PI / 3
    });

    LootBox.onModelLoaded = () => {
      const Card = LootBox.children[0].children.find(c => c.name === 'CYBERCARTA_SUB');
      Card.position.set(0, 0, 0);
      Card.rotateX(Math.PI / 2);

      const tween = new TWEEN.Tween(Camera.position)
      .to({ x: 0, y: 4, z: 7 }, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        Camera.lookAt(LootBox.position);
      })
      .start()
      .onComplete(() => {
        document.addEventListener("click", () => {
          const microJump = new TWEEN.Tween(LootBox.position)
            .to({ y: LootBox.position.y + 2 }, 300)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .yoyo(true)
            .repeat(1);

          const slightRotate = new TWEEN.Tween(LootBox.rotation)
            .to({ y: LootBox.rotation.y + 0.4 }, 200)
            .easing(TWEEN.Easing.Quadratic.InOut)

          const LootBoxBase = LootBox.children[0].children[0].children.find(c => c.name === 'Cube');
          LootBoxBase.position.x -= 0.65;
          LootBoxBase.position.z -= 0.1;
          LootBoxBase.rotateZ(Math.PI / 6);

          microJump.start();
          slightRotate.delay(100).start();

          const jumpUp = new TWEEN.Tween(Card.position)
            .to({ y: 70, z: 18, x: -30 }, 400)
            .easing(TWEEN.Easing.Quadratic.Out);

          const rotate = new TWEEN.Tween(Card.rotation)
            .to({ x: Card.rotation.x + Math.PI/2, y: Card.rotation.y + Math.PI/2.5 }, 900)
            .easing(TWEEN.Easing.Quadratic.InOut);

          const jumpDown = new TWEEN.Tween(Card.position)
            .to({ y: 35, z: 5, x: -45 }, 400)
            .easing(TWEEN.Easing.Quadratic.In);

          jumpUp.chain(jumpDown);

          jumpUp.start();
          rotate.start();

          jumpDown.onComplete(() => {
            Item.visible = true;
          });

          const Item = new PropStatic("assets/models/open/items/pistol.fbx", {
            scale: 0.15,
            rotation: new THREE.Euler(0, Math.PI, 0),
            position: new THREE.Vector3(0, 2, 0),
            material: new HolographicMaterial({
              signalSpeed: 4,
              hologramColor: 0x00d5ff,
              enableBlinking: true,
              hologramOpacity: 0.68,
              blendMode: THREE.NormalBlending,
              time: Process.clock.getDelta(),
              fresnelOpacity: 0.8,
              fresnelAmount: 20,
              scanlineSize: 4,
              hologramBrightness: 1,
              blinkFresnelOnly: false,
              side: THREE.DoubleSide,
              depthTest: true
            }),
          });

          Item.visible = false;

          Card.rotation.y = Math.PI/2;
          const rotateCard = new TWEEN.Tween(Card.rotation)
            .to({ y: Card.rotation.y - Math.PI / 6 }, 5000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .yoyo(true)
            .repeat(Infinity)
            .start();

          Item.rotateX(-Math.PI / 2);
          Card.add(Item);

        }, { once: true });
      });
    }

    this.add(LootBox);
    this.add(new LightEnvironment(0xfafffb, 1.5));
  }
}