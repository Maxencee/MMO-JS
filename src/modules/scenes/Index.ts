import * as THREE from "three";
import LightEnvironment from "../light/LightEnvironment";
import PlayerController from "../player/PlayerController";
import Process from "../runtime/Process";
import PlayerCamera from "../player/PlayerCamera";
import BoundingBox from "../props/BoundingBox";
import PropInteractable from "../props/PropInteractable";

export default class Index extends THREE.Scene {
  constructor() {
    super();

    this.background = new THREE.Color(0x323232);

    BoundingBox.setMode('wireframe');
    Process.setCamera(new PlayerCamera);

    const floor = new BoundingBox(20, 0.1, 20) as BoundingBox & { isFloor: boolean };
    floor.add(new THREE.Mesh(new THREE.BoxGeometry(20, 0.1, 20), new THREE.MeshBasicMaterial({ color: 0x504763 })));
    floor.isFloor = true;

    const vending = new PropInteractable('assets/models/vending-machine/model.fbx', {
      scale: 1.2,
      rotation: new THREE.Euler(0, -Math.PI/2, 0),
      position: new THREE.Vector3(3, 0, -4)
    });

    vending.position.y += 0.4;

    this.add(vending);

    this.add(floor);
    this.add(new PlayerController);
    this.add(new LightEnvironment(0xfafffb, 1));
  }
}
