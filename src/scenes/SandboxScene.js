import PlayerController from "../PlayerController";
import Scene from "../classes/Scene";
import LightEnvironment from "../entities/LightEnvironment";
import Floor from "../props/Floor";
import BoxPushable from "../props/BoxPushable";
import BoundingBoxInteractable from "../entities/BoundingBoxInteractable";
import BoundingBox from "../entities/BoundingBox";

export default class SandboxScene extends Scene {
    constructor (backgroundColor) {
        super(backgroundColor);
        
        BoundingBox.setMode('hidden');
        this.add(new LightEnvironment(0xffffff, 3));

        const box = new BoxPushable;
        box.position.set(4, 0, 5);
        
        const box2 = new BoxPushable;
        box2.position.set(-1, 0, 3);
        
        this.add(new Floor);
        this.add(box);
        this.add(box2);
        
        this.add(new PlayerController("Leela"));
    }
}