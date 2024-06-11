import * as THREE from "three";

export default class Scene extends THREE.Scene {
    constructor (backgroundColor) {
        super();

        this.background = new THREE.Color(backgroundColor);
    }
}