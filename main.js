import PlayerController from "./src/PlayerController";
import LightEnvironment from "./src/classes/LightEnvironment";
import PlayerCamera from "./src/PlayerCamera";
import Process from "./src/classes/Process";
import Scene from "./src/classes/Scene";
import BoundingBox from "./src/entities/BoundingBox";
import Floor from "./src/entities/Floor";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import PropDynamic from "./src/entities/PropDynamic";
import { Vector3 } from "three";
import BoundingBoxInteractable from "./src/entities/BoundingBoxInteractable";

("use strict");
(async function () {
    const World = new Process({
        scene: new Scene(0x1B1B1B),
        camera: new PlayerCamera()
    });

    // const controls = new OrbitControls(Process.camera, World.renderer.domElement);
    // controls.enablePan = false;
    // controls.maxDistance = 20;
    // controls.minDistance = 5;
    
    // controls.zoomSpeed = 2;
    // controls.minDistance = 4;
    // controls.maxDistance = 12;
    // controls.rotateSpeed = 1;
    
    // Process.addToQueue(controls.update);

    Process.addToScene(new LightEnvironment(0xffffff, 2));
    
    const floor = new Floor();
    Process.addToScene(floor);

    const wall = new PropDynamic('assets/models/wall/scene.gltf', {
        boundingColor: 0xff6b26,
        scale: new Vector3(0.0045, 0.0045, 0.0045),
        position: new Vector3(0, -1.8, 0.4),
        shadow: PropDynamic.RECEIVE_SHADOW
    });

    wall.position.x = 4.5;
    wall.position.z = 3;
    Process.addToScene(wall);

    const smallWall = new BoundingBoxInteractable(3, 0.5, 1, 0xff4ff1);

    smallWall.position.x = 4;
    smallWall.position.z = -4;
    Process.addToScene(smallWall);

    const player = new PlayerController();

    Process.addToScene(player);

    document.addEventListener('contextmenu', (evt) => evt.preventDefault());

    World.render();
})();
