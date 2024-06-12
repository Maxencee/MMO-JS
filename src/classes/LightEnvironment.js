import { AmbientLight, DirectionalLight, Vector3 } from "three"
import Process from "./Process";

export default class LightEnvironment extends DirectionalLight {
    constructor (color, intensity) {
        super(color, intensity);

        this.position.set(6, 18, 2);
        this.target.position.set(0, 0, 0);
        this.castShadow = true;

        this.shadow.mapSize.width = 100;
        this.shadow.mapSize.height = 100;
        this.shadow.camera.near = 0.2;
        this.shadow.camera.far = 2000;

        const ambientLight = new AmbientLight(color);
        ambientLight.intensity = intensity - 0.65;
        this.add(ambientLight);
    }
}