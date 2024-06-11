import { AmbientLight, DirectionalLight } from "three"

export default class LightEnvironment extends DirectionalLight {
    constructor (color, intensity) {
        super(color, intensity);

        this.position.set(11, 10, 12);
        this.target.position.set(0, 0, 0);
        this.castShadow = true;

        const ambientLight = new AmbientLight(color);
        ambientLight.intensity = intensity - 0.65;
        this.add(ambientLight);
    }
}