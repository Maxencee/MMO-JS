import * as THREE from "three";
import BoundingBox from "./BoundingBox";
import { FBXLoader, GLTFLoader } from "three/examples/jsm/Addons.js";
import Process from "../classes/Process";

export default class PropDynamic extends BoundingBox {
    static RECEIVE_SHADOW = 2;
    static CAST_SHADOW = 1;

    constructor (model, options = null) {
        const isFBX = model.endsWith('.fbx');

        let material;
        if(options && options.path) {
            const texture = new THREE.TextureLoader().load(options.path);
            texture.mapping = options.mapping || THREE.UVMapping;
            texture.channel = options.channel || 0;
            material = new THREE.MeshBasicMaterial({ map: texture });
        }

        if(options && options.material) {
            material = options.material;
        }

        let mesh;
        const loader = isFBX ? new FBXLoader() : new GLTFLoader();
        loader.load(model, (model) => {
            model.traverse(node => {
                if(node.isMesh) {
                    if(material) node.material = material;
                    if(options.shadow >= PropDynamic.CAST_SHADOW) node.castShadow = true;
                    if(options.shadow == PropDynamic.RECEIVE_SHADOW) node.receiveShadow = true;
                }
            });

            mesh = isFBX ? model : model.scene;

            if(options.position) mesh.position.copy(options.position);
            if(options.scale) mesh.scale.copy(options.scale);
            if(options.rotation) mesh.rotation.copy(options.rotation);

            this.mixer = new THREE.AnimationMixer(mesh);
            this.mixer.getAction = (name) =>
                THREE.AnimationClip.findByName(mesh.animations, name);

            this.model = mesh;
            this.add(mesh);
            
            const bounding = new THREE.Box3().setFromObject(mesh); 
            const size = bounding.getSize(new THREE.Vector3());
            this.position.set(0, size.y/2, 0);
            this.geometry.scale(size.x, size.y, size.z);

            this.onModelLoaded();
        });

        super(1, 1, 1, 0xffffff);
    }

    onModelLoaded () { }

    animations = {};
    mixer;
    model;
}