import PlayerController from "./src/PlayerController";
import LightEnvironment from "./src/classes/LightEnvironment";
import PlayerCamera from "./src/PlayerCamera";
import Process from "./src/classes/Process";
import Scene from "./src/classes/Scene";
import BoundingBox from "./src/entities/BoundingBox";
import Floor from "./src/entities/Floor";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

("use strict");
(async function () {
    const World = new Process({
        scene: new Scene(0x1B1B1B),
        camera: new PlayerCamera()
    });

    const controls = new OrbitControls(Process.camera, World.renderer.domElement);
    controls.enablePan = false;
    controls.maxDistance = 20;
    controls.minDistance = 5;
    
    controls.zoomSpeed = 2;
    controls.minDistance = 4;
    controls.maxDistance = 12;
    controls.rotateSpeed = 1;
    
    Process.addToQueue(controls.update);

    Process.addToScene(new LightEnvironment(0xffffff, 2));
    
    const floor = new Floor();
    Process.addToScene(floor);

    const wall = new BoundingBox(5, 4, 1, 0xff6b26);
    wall.position.x = 4;
    wall.position.z = 3;
    Process.addToScene(wall);

    const player = new PlayerController();

    Process.addToScene(player);

    World.render();
})();
