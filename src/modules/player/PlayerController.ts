import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import PropDynamic from "../props/PropDynamic";
import Process from "../runtime/Process";

export default class PlayerController extends PropDynamic {
    constructor () {
        super('/assets/models/player.fbx', {
            scale: 0.1
        });

        Process.camera.position.set(-3.5, 4, -3.5);
        Process.camera.lookAt(0, 1, 0);
    }

    isMoving = false;
    isLocked = false;
    speed = 300;

    tween = null;

    interactable;

    onModelLoaded () {
        console.log(this.animations);

        document.addEventListener('mousedown', (event) => {
            this.move(event);
        });

        document.addEventListener('mousemove', (event) => {
            const objects = Process.camera.intersect(event);
            const interactable = objects.find(e => e.object?.isInteractable && this.position.distanceTo(e.object.position) < 2);

            if(interactable) {
                if(interactable.object.id !== this.interactable?.id) {
                    this.interactable?.interactLeave();
                    this.interactable = interactable.object;
                    this.interactable.interactOver();
                }
            } else {
                this.interactable?.interactLeave();
                this.interactable = null;
            }
        });
    }

    onInteract (interactable) {
        this.isLocked = true;
        this.playActionOnce('pushing').then(() => {
            this.isLocked = false;
        });
    }

    move (event) {
        if(event.button !== 2 || this.isLocked) return;

        if(this.interactable && !this.isMoving) return this.interactable.interact(this);

        this.isMoving = false;
        let element = Process.camera.intersect(event).find(e => e.object?.isFloor);
        
        if(element && element.normal.y === 1) {
            let target = new THREE.Vector3(...element.point);
            let start = this.position.clone();

            if(target.y > 0.35) return;

            target.y += this.size.y/2;

            let distance = start.distanceTo(target);
            let direction = new THREE.Vector3().subVectors(target, start);
            direction.y = 0;

            let qt = new THREE.Quaternion().setFromRotationMatrix(
                new THREE.Matrix4().lookAt(
                    direction,
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0, 1, 0)
                )
            );

            if(!this.tween) this.playAction('walking');

            this.tween?.stop();

            this.tween = new TWEEN.Tween(start).to(target, (distance * 1000) / (this.speed / 100))
            .easing(TWEEN.Easing.Linear.None)
            .delay(0)
            .onStart(() => {
                this.isMoving = true;
            })
            .onUpdate((position) => {
                let [collisions, colsize] = this.getCollisions(target);

                if(collisions.length && collisions[0].distance < 1) {
                    this.tween?.stop();
                    this.playAction('idle');
                    this.tween = null;
                    this.isMoving = false;
                }
                
                Process.camera.position.add((new THREE.Vector3()).subVectors(this.position, position).multiplyScalar(-1));

                this.position.copy(position);
                this.quaternion.slerp(qt, .1);
            })
            .onComplete(() => {
                this.playAction('idle');
                this.tween = null;
                this.isMoving = false;
            })
            .start();
        }
    }
}