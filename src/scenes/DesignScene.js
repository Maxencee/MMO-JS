import Scene from "../classes/Scene";
import LightEnvironment from "../entities/LightEnvironment";
import Floor from "../props/Floor";
import BoundingBox from "../entities/BoundingBox";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import UI from "../classes/UI";
import * as THREE from "three";
import Process from "../classes/Process";
import { Inventory } from "../ui/Inventory";
import { MapButtons } from "../ui/MapButtons";
import PropStatic from "../entities/PropStatic";
import PropDetail from "../entities/PropDetail";

export default class DesignScene extends Scene {
  static mapdata = {
    items: []
  }

  static loadMap (data) {
    data.items.forEach(item => {
      const prop = new PropDetail(item.model, {
        position: new THREE.Vector3(item.position.x, item.position.y, item.position.z),
        rotation: new THREE.Euler(item.rotation._x, item.rotation._y, item.rotation._z),
        scale: new THREE.Vector3(item.scale.x, item.scale.y, item.scale.z),
        shadow: 2
      });

      prop.onModelLoaded = () => {
        Process.addToScene(prop);
        DesignScene.mapdata.items.push({
          position: prop.position,
          rotation: prop.rotation,
          scale: prop.scale,
          model: item.model,
          id: prop.id
        });
      }
    });
  }

  constructor() {
    super(0xe9f0f5);

    BoundingBox.setMode("hidden");
    this.add(new LightEnvironment(0xfaf4f0, 3));

    UI.add(MapButtons);
    UI.add(Inventory.create(), "inventoryContainer");

    this.add(new Floor());

    const transformControl = new TransformControls(Process.camera, UI.renderers);
    transformControl.addEventListener("dragging-changed", function (event) {
      Process.camera.controls.enabled = !event.value;
      transformControl.isUsed = true;
    });

    transformControl.addEventListener("change", updateObject);

    transformControl.visible = false;
    transformControl.setRotationSnap(Math.PI / 12);
    transformControl.setTranslationSnap(0.1);
    transformControl.setScaleSnap(0.1);
    transformControl.setMode("translate");
    this.add(transformControl);

    function updateObject () {
      if(transformControl.object) {
        const item = DesignScene.mapdata.items.find(e => e?.id === transformControl.object?.id);
        if(!item) return;

        item.position.copy(transformControl.object.position);
        item.rotation.copy(transformControl.object.rotation);
        item.scale.copy(transformControl.object.scale);
      }
    }

    window.addEventListener("contextmenu", () => {
      transformControl.object?.outline?.removeFromParent();
      transformControl.detach();
    });

    window.addEventListener("keypress", (event) => {
      if (event.code === "KeyX") {
        DesignScene.mapdata.items = DesignScene.mapdata.items.filter(e => e.id !== transformControl.object?.id);
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

      if(event.code === "KeyE") {
        UI.get("inventoryContainer").classList.toggle("hidden");
      }

      if(event.code === "KeyP") {
        transformControl.object?.scale.multiplyScalar(1.2);
        updateObject();
      }

      if(event.code === "KeyW") {
        transformControl.object?.scale.multiplyScalar(0.8);
        updateObject();
      }

      if(event.shiftKey) {
        transformControl.setRotationSnap(0);
        transformControl.setTranslationSnap(0);
        transformControl.setScaleSnap(0);
      } else {
        transformControl.setRotationSnap(Math.PI / 12);
        transformControl.setTranslationSnap(0.1);
        transformControl.setScaleSnap(0.1);
      }

      if (event.code === "Space") {
        if (!transformControl.object) return;
          transformControl.object.position.y =
            transformControl.object.size.y / 2;
          
          transformControl.object.rotation.copy(new THREE.Euler(0, 0, 0));

          updateObject();
      }
    });

    UI.renderers.addEventListener("click", (event) => {
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
        ).pop()?.object;

        transformControl.object?.outline?.removeFromParent();
        transformControl.detach();

        if (object) {
          transformControl.attach(object);
          transformControl.visible = true;

          let outlineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.FrontSide, transparent: true, opacity: 0.5, emissive: 0xffffff, emissiveIntensity: 5.0 });
          let outline = new THREE.Mesh(transformControl.object.geometry, outlineMaterial);
          outline.scale.multiplyScalar(1.015);
          transformControl.object.outline = outline;
          transformControl.object.add(outline);
        }
      }
    });
  }
}
