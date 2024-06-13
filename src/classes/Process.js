import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { CSS2DRenderer } from "three/examples/jsm/Addons.js";

export default class Process {
    renderer;
    renderer2D;
    renderID;

    static scene;
    static camera;
    static lod;

    static queue = [];

    constructor ({ scene, camera }) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.frustumCulled = true;
        this.renderer.gammaOutput = true;
        this.renderer.gammaFactor = 1;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        this.renderer2D = new CSS2DRenderer();
        this.renderer2D.setSize(window.innerWidth, window.innerHeight);
        this.renderer2D.domElement.classList.add('renderer2D');
        document.body.appendChild(this.renderer2D.domElement);
        
        Process.scene = scene;
        Process.camera = camera;
        Process.lod = new THREE.LOD();
    }

    static getSceneObjects () {
        return Process.scene.children;
    }
    
    static addToQueue (callback) {
        Process.queue.push(callback);
        return true;
    }

    static addToScene (object) {
        if(Process.scene) {
            Process.scene.add(object);
            return true;
        } else {
            console.error("No current scene");
            return false;
        }
    }

    static switchScene (scene) {
        Process.scene = scene;
    }

    render () {
        if(!Process.scene || !Process.camera) {
            cancelAnimationFrame(this.renderID);
            return console.error("Scene or Camera unloaded");
        }

        TWEEN.update();
        Process.queue.filter(callback => callback() !== false);

        this.renderer.render(Process.scene, Process.camera);
        this.renderer2D.render(Process.scene, Process.camera);
        this.renderID = requestAnimationFrame(() => this.render());
    }
}