import { AmbientLight, CameraHelper, DirectionalLight, Vector3 } from "three";

export default class LightEnvironment extends DirectionalLight {
    constructor (color = 0xffffff, intensity = 1, 
        position = new Vector3(0, 10, 0), lookAt = new Vector3(0, 0, 0), 
        helper = false) {

        super(color, intensity);

        this.position.copy(position);
        this.target.position.copy(lookAt);
        this.castShadow = true;

        this.shadow.mapSize.width = 512;
        this.shadow.mapSize.height = 512;
        this.shadow.camera.near = 0.2;
        this.shadow.camera.far = 100;
        this.shadow.camera.top = 64;
        this.shadow.camera.bottom = -64;
        this.shadow.camera.left = -64;
        this.shadow.camera.right = 64;

        if(helper) {
            const helper = new CameraHelper(this.shadow.camera);
            this.add(helper);
        }

        const ambientLight = new AmbientLight(color);
        ambientLight.intensity = intensity - 0.65;
        this.add(ambientLight);
    }
}