import Scene from "../classes/Scene";
import LightEnvironment from "../entities/LightEnvironment";
import Floor from "../props/Floor";
import BoundingBox from "../entities/BoundingBox";
import { NatureCollection } from "../props/items/NatureCollection";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import UI from "../classes/UI";
import * as THREE from "three";
import Process from "../classes/Process";

export default class DesignScene extends Scene {
    constructor (backgroundColor) {
        super(backgroundColor);
        
        BoundingBox.setMode('hidden');
        this.add(new LightEnvironment(0xffffff, 3));
        
        this.add(new Floor);

        NatureCollection.items.forEach(item => {
            UI.add(UI.element("button", { innerText: item, onclick: () => {
                const prop = NatureCollection.createItem(item, {
                    position: new THREE.Vector3(0, 0, 0),
                    rotation: new THREE.Euler(0, 0, 0),
                    scale: new THREE.Vector3(1, 1, 1),
                });

                this.add(prop);
            }, style: "margin: 0 0.2rem" }));
        });

        const transformControl = new TransformControls(Process.camera, UI.root);
        transformControl.addEventListener("dragging-changed", function (event) {
          Process.camera.controls.enabled = !event.value;
        });

        transformControl.visible = false;
        transformControl.setMode('translate');
        this.add(transformControl);

        window.addEventListener('contextmenu', () => transformControl.detach());

        window.addEventListener("keypress", (event) => {
            //console.log(event.code);
            if (event.code === "KeyX") {
                transformControl.object?.removeFromParent();
                transformControl.detach();
            }

            if (event.code === "KeyR") {
                transformControl.setMode("rotate");
            }

            if (event.code === "KeyT") {
                transformControl.setMode("translate");
            }

            if (event.code === "KeyS") {
                transformControl.setMode("scale");
            }

            if(event.code === "Space") {
                if(transformControl.object) transformControl.object.position.y = transformControl.object.size.y / 2;
            }
        });
    
        UI.root.addEventListener("click", (event) => {
          const raycaster = new THREE.Raycaster();
          const mouse = new THREE.Vector2();
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          raycaster.setFromCamera(mouse, Process.camera);
          const intersects = raycaster.intersectObjects(
            Process.scene.children,
            true
          );
    
          if (intersects.length > 0) {
            const object = intersects.filter(e => e.object.model && e.object.id !== transformControl.object?.id)[0]?.object;
            if(!object) return;
            transformControl.attach(object);
            transformControl.visible = true;
          } else {
            transformControl.detach();
          }
        });
    }
}