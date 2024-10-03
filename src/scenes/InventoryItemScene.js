import Scene from "../classes/Scene";
import LightEnvironment from "../entities/LightEnvironment";
import * as THREE from "three";
import PropStatic from "../entities/PropStatic";

export default class InventoryItemScene extends Scene {
    domElement;

    constructor (itemName, color = 0x333333, size = { width: 200, height: 200 }) {
        super(color);
        
        this.add(new LightEnvironment(0xffffff, 3));

        const item = new PropStatic(itemName, {});

        let render = new THREE.WebGLRenderer({ antialias: true,  });
        render.setSize(size.width, size.height);
        render.setPixelRatio(window.devicePixelRatio);
    
        const camera = new THREE.PerspectiveCamera();

        camera.position.set(3, 2, 4);
        camera.lookAt(new THREE.Vector3(0, 1, 0));

        camera.aspect = 1;
        camera.updateProjectionMatrix();
    
        item.onModelLoaded = () => {
            render.render(this, camera);
            render.domElement.classList.remove('animate-pulse');
        };
        
        this.add(item);
        this.add(camera);

        this.domElement = render.domElement;
    }
}