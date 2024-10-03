import Process from "../classes/Process";
import UI from "../classes/UI";
import PropStatic from "../entities/PropStatic";
import DesignScene from "../scenes/DesignScene";
import InventoryItemScene from "../scenes/InventoryItemScene";
import * as THREE from "three";

export class InventoryItem {
    static create (itemName, type) {
        const path = `/assets/models/${type}/${itemName}`;
        const item = new InventoryItemScene(path);

        item.domElement.className = 'animate-pulse bg-neutral-600 rounded';

        return UI.element("button", {
            class: "text-neutral-200 flex flex-col gap-2 items-center w-[200px]",
        }, [
            item.domElement,
            UI.element('span', {
                class: "truncate max-w-full"
            }, [
                new String(itemName).replace(/_|.*\//g, " ").replace(/\.\w+/g, "")
            ])
        ], {
          click: () => {
            const item = new PropStatic(path, {
              position: new THREE.Vector3(),
              rotation: new THREE.Euler(),
              scale: new THREE.Vector3(1, 1, 1),
              shadow: 2,
            });
      
            item.onModelLoaded = () => {
              Process.addToScene(item);
              DesignScene.mapdata.items.push({
                position: item.position,
                rotation: item.rotation,
                scale: item.scale,
                model: path,
            })}
          }
        });
    }
}