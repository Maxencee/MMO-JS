import Scene from "../classes/Scene";
import BoundingBox from "../entities/BoundingBox";
import LightEnvironment from "../entities/LightEnvironment";
import * as THREE from "three";
import Prop from "../entities/Prop";
import ControlCamera from "../props/ControlCamera";

export default class ItemScene extends Scene {
    item;

    constructor (item, camera) {
        super(0x333333);
        
        this.add(new LightEnvironment(0xffffff, 3));

        this.item = new Prop('/assets/models/furniture/' + item, {});
        
        this.add(this.item);
        this.add(camera);
    }

    static init (item, container) {
        const camera = new THREE.PerspectiveCamera();

        camera.position.set(2, 2, 3);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        return [camera, new ItemScene(item, camera)];
    }
}