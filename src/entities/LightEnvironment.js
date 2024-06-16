import { AmbientLight, CameraHelper, DirectionalLight, Vector3 } from "three";

export default class LightEnvironment extends DirectionalLight {
    constructor (color, intensity) {
        super(color, intensity);

        this.position.set(12, 18, 4);
        this.target.position.set(0, 0, 0);
        this.castShadow = true;

        this.shadow.mapSize.width = 512;
        this.shadow.mapSize.height = 512;
        this.shadow.camera.near = 0.2;
        this.shadow.camera.far = 100;
        this.shadow.camera.top = 32;
        this.shadow.camera.bottom = -32;
        this.shadow.camera.left = -32;
        this.shadow.camera.right = 32;

        const helper = new CameraHelper(this.shadow.camera);
        this.add(helper);

        const ambientLight = new AmbientLight(color);
        ambientLight.intensity = intensity - 0.65;
        this.add(ambientLight);
    }
}