import Scene from "../classes/Scene";
import LightEnvironment from "../entities/LightEnvironment";
import Floor from "../props/Floor";
import BoundingBox from "../entities/BoundingBox";
import { FurnitureCollection } from "../props/items/FurnitureCollection";
import { NatureCollection } from "../props/items/NatureCollection";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import UI from "../classes/UI";
import * as THREE from "three";
import Process from "../classes/Process";
import ItemScene from "./ItemScene";

export default class DesignScene extends Scene {
  constructor() {
    super(0xe9f0f5);

    BoundingBox.setMode("hidden");
    this.add(new LightEnvironment(0xfaf4f0, 3));

    this.add(new Floor());

    UI.add(UI.element('div', {
      class: "absolute-center",
      style: "display: flex; flex-wrap: wrap; justify-content: center; align-items: center; padding: 0.5rem; overflow-y: auto; height: 50dvh"
    }), 'container');

    FurnitureCollection.items.forEach((item) => {
      let r = new THREE.WebGLRenderer({ antialias: true,  });
      r.setSize(200, 200);
      r.setPixelRatio(window.devicePixelRatio);
  
      let [camera, scene] = ItemScene.init(item);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
  
      scene.item.onModelLoaded = () => r.render(scene, camera);

      UI.get('container').appendChild(
        UI.element("button", {
          innerText: item,
          onclick: () => {
            const prop = FurnitureCollection.createItem(item, {
              position: new THREE.Vector3(0, 0, 0),
              rotation: new THREE.Euler(0, 0, 0),
              scale: new THREE.Vector3(1, 1, 1),
                shadow: 2,
            });

            this.add(prop);
            mapdata.items.push({
              position: prop.position,
              rotation: prop.rotation,
              scale: prop.scale,
              name: prop.model?.name,
              model: item,
              id: prop.id
            });
          },
          style: "margin: 0 0.2rem",
        }, [
          r.domElement
        ])
      );
    });

    UI.add(
      UI.element('button', {
        innerText: 'Save',
        onclick: () => {
          console.log(mapdata, JSON.stringify(mapdata));
        }
      })
    );

    UI.add(
      UI.element('button', {
        innerText: 'Load test.json',
        style: "margin-left: 4rem",
        onclick: () => {
          fetch('/src/scenes/maps/test.json').then(res => res.json()).then(data => {
            data.items.forEach(item => {
              console.log(item);
              const prop = FurnitureCollection.createItem(item.model, {
                position: new THREE.Vector3(item.position.x, item.position.y, item.position.z),
                rotation: new THREE.Euler(item.rotation._x, item.rotation._y, item.rotation._z),
                scale: new THREE.Vector3(item.scale.x, item.scale.y, item.scale.z),
                shadow: 2
              });

              prop.onModelLoaded = () => {
                this.add(prop);
                mapdata.items.push({
                  position: prop.position,
                  rotation: prop.rotation,
                  scale: prop.scale,
                  model: item.model,
                  id: prop.id
                });
              }
            });
          });
        }
      })
    );

    const mapdata = {
      items: []
    };

    const transformControl = new TransformControls(Process.camera, UI.renderers);
    transformControl.addEventListener("dragging-changed", function (event) {
      Process.camera.controls.enabled = !event.value;
      transformControl.isUsed = true;
    });

    transformControl.addEventListener("change", updateObject);

    transformControl.visible = false;
    transformControl.setMode("translate");
    this.add(transformControl);

    function updateObject () {
      if(transformControl.object) {
        const item = mapdata.items.find(e => e?.id === transformControl.object?.id);
        item.position.copy(transformControl.object.position);
        item.rotation.copy(transformControl.object.rotation);
        item.scale.copy(transformControl.object.scale);
      }
    }

    window.addEventListener("contextmenu", () => transformControl.detach());

    window.addEventListener("keypress", (event) => {
      //console.log(event.code);
      if (event.code === "KeyX") {
        mapdata.items = mapdata.items.filter(e => e.id !== transformControl.object?.id);
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

      if (event.code === "Space") {
        if (!transformControl.object) return;
          transformControl.object.position.y =
            transformControl.object.size.y / 2;
          
          transformControl.object.rotation.copy(new THREE.Euler(0, 0, 0));

          updateObject();
      }
    });

    UI.root.addEventListener("click", (event) => {
      if (transformControl.isUsed) return (transformControl.isUsed = false);
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
        const object = intersects.filter(
          (e) => e.object.model && e.object.id !== transformControl.object?.id
        )[0]?.object;
        if (!object) return;
        transformControl.attach(object);
        transformControl.visible = true;
      } else {
        transformControl.detach();
      }
    });
  }
}
