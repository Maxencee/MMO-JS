import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";

export default class Process {
    renderer;
    scene;
    camera;
    clock;
    lod;

    queue = [];
    renderID;

    constructor ({ scene, camera }) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.frustumCulled = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        this.lod = new THREE.LOD();
        this.clock = new THREE.Clock(true);

        this.scene = scene;
        this.camera = camera;
    }

    getSceneChildren () {
        return this.scene.children;
    }
    
    addToQueue (callback) {
        this.queue.push(callback);
        return true;
    }

    addToScene (object) {
        if(this.scene) {
            this.scene.add(object);
            return true;
        } else {
            console.error("No current scene");
            return false;
        }
    }

    render () {
        if(!this.scene || !this.camera) {
            cancelAnimationFrame(this.renderID);
            return console.error("Scene or Camera unloaded");
        }

        TWEEN.update();
        this.queue.filter(callback => callback(this, this.clock.getDelta()) !== false);
        this.renderer.render(this.scene, this.camera);
        this.renderID = requestAnimationFrame(this.render.bind(this));
    }
}