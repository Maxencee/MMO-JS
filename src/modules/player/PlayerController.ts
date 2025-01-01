import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import PropDynamic from "../props/PropDynamic";
import Process from "../runtime/Process";

export default class PlayerController extends PropDynamic {
    constructor () {
        super('/assets/models/player.fbx', {
            scale: 0.1
        });

        Process.camera.position.set(-3.5, 4, -3.5);
        Process.camera.lookAt(0, 1, 0);
    }

    onModelLoaded(): void {
        console.log(this.animations);
    }
}