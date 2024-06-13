import Scene from "../classes/Scene";
import PlayerController from "../PlayerController";
import LightEnvironment from "../entities/LightEnvironment";
import Floor from "../props/Floor";

import { LoopOnce, Vector3 } from "three";
import BoundingBoxInteractable from "../entities/BoundingBoxInteractable";
import PropStatic from "../entities/PropStatic";
import PropInteractable from "../entities/PropInteractable";
import Process from "../classes/Process";
import BoxPushable from "../props/BoxPushable";

export default class SandboxScene extends Scene {
    constructor (backgroundColor) {
        super(backgroundColor);

        this.add(new LightEnvironment(0xffffff, 2));

        const floor = new Floor();
        this.add(floor);
      
        const wall = new PropStatic("assets/models/wall/scene.gltf", {
          bounding: null,
          scale: new Vector3(0.0045, 0.0045, 0.0045),
          position: new Vector3(0, -1.8, 0.4),
          shadow: PropStatic.RECEIVE_SHADOW,
        });
      
        wall.position.x = 4.5;
        wall.position.z = 3;
        this.add(wall);
      
        const chest = new PropInteractable("assets/models/chest/source/Chest.fbx", {
          texture: 'assets/models/chest/textures/Chest_D.png',
          scale: new Vector3(0.008, 0.008, 0.008),
          position: new Vector3(0, 0, 0),
          shadow: PropStatic.RECEIVE_SHADOW,
        });

        chest.interact = function () {
          let animation = this.mixer.clipAction(this.children[0].animations[0]);
          animation.loop = LoopOnce;
          animation.clampWhenFinished = true;
          animation.play();
          console.log(animation);
        }

        chest.onModelLoaded = function () {
          Process.addToQueue(() => {
            chest.mixer.update(chest.clock.getDelta());
          });
        }

        console.log(chest);
      
        chest.position.x = 4;
        chest.position.z = -2;
        this.add(chest);
      
        const jumpWall = new BoundingBoxInteractable(3, 0.5, 1, 0xff9d4d);
      
        jumpWall.position.x = -4;
        jumpWall.position.z = -4;
        this.add(jumpWall);

        this.add(new BoxPushable());
      
        const player = new PlayerController();
      
        this.add(player);
    }
}