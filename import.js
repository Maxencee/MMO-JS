import * as THREE from "three";
import * as CANNON from "cannon-es";
import TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader, GLTFLoader } from "three/examples/jsm/Addons.js";

("use strict");
(async function () {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1b1b1b);

  const camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const floorable = [];

  function setOuterView(event) {}

  camera.intersect = function (event) {
    if (!camera) return;
    let mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(floorable, true);
  };

  const axesHelper = new THREE.AxesHelper(5);
  axesHelper.position.y = 0.01;
  scene.add(axesHelper);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.maxDistance = 20;
  controls.minDistance = 5;
  
  controls.zoomSpeed = 2;
  //   controls.minDistance = 4;
  //   controls.maxDistance = 12;
  controls.rotateSpeed = 1;
  controls.update();

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshBasicMaterial({ color: 0x666666 })
  );

  ground.rotateX(-Math.PI / 2);
  floorable.push(ground);

  scene.add(ground);

  const size = 30;
  const divisions = 30;

  const gridHelper = new THREE.GridHelper(size, divisions);
  scene.add(gridHelper);

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshBasicMaterial({ wireframe: true })
  );

  box.position.set(0.5, 1, 0.5);

  const collidable = [];

  const pointerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  pointerMaterial.polygonOffset = true;
  pointerMaterial.polygonOffsetFactor = -0.1;
  const pointer = new THREE.Mesh(
    new THREE.RingGeometry(0.45, 0.5),
    pointerMaterial
  );
  pointer.rotateX(-Math.PI / 2);
  scene.add(pointer);

  function setCursor(event) {
    let intersects = camera.intersect(event);
    if (intersects[0]) {
      var directionVector = new THREE.Vector3();
      var start = box.position.clone();
      directionVector.subVectors(intersects[0].point, start).normalize();

      var ray = new THREE.Raycaster(start, directionVector.clone().normalize());

      var collisionResults = ray.intersectObjects(collidable, true);
      if (collisionResults.length > 0) {
        line.material.color = new THREE.Color(0xff2e2e);
        pointer.material.color = new THREE.Color(0xff2e2e);
        box.canMove = false;
      } else {
        line.material.color = new THREE.Color(0xffffff);
        pointer.material.color = new THREE.Color(0xffffff);
        box.canMove = true;
      }

      pointer.position.x =
        intersects[0].point.x -
        (intersects[0].point.x % 1) +
        0.5 * Math.sign(intersects[0].point.x);
      pointer.position.z =
        intersects[0].point.z -
        (intersects[0].point.z % 1) +
        0.5 * Math.sign(intersects[0].point.z);
      updateLine();
    }
  }

  let targetPointer;

  box.setMoving = function (event) {
    if (event.button !== 2 || !box.canMove) return;
    let intersects = camera.intersect(event);
    let target = intersects.find((o) => o.object.isMesh);
    if (target) {
      // event.worldTarget = target.object;
      if (targetPointer) targetPointer.removeFromParent();

      const tarpm = new THREE.MeshBasicMaterial({ color: 0xffffff });
      tarpm.polygonOffset = true;
      tarpm.polygonOffsetFactor = -0.2;
      const targetP = new THREE.Mesh(new THREE.CircleGeometry(0.5), tarpm);
      targetP.position.copy(pointer.position);
      targetP.rotateX(-Math.PI / 2);
      scene.add(targetP);
      targetPointer = targetP;

      box.moveTo(pointer.position);
      return (
        target.object.onclick?.(event) || target.object.parent?.onclick?.(event)
      );
    }
  };

  const Playerloader = new FBXLoader();
  Playerloader.load(`assets/player/model.fbx`, function (model) {
    model.scale.set(0.032, 0.032, 0.032);
    model.position.set(0, -1, 0);
    console.log(model);

    model.traverse(function (node) {
      if (node.isMesh) {
        node.material = new THREE.MeshBasicMaterial({ color: 0xffa585 });
      }
    });

    model.mixer = new THREE.AnimationMixer(model);
    model.animations.idle = model.mixer.clipAction(model.animations[0]);
    model.animations.walk = model.mixer.clipAction(model.animations[1]);
    model.animations.t = model.mixer.clipAction(model.animations[2]);
    model.animations.idle.play();
    box.model = model;
    box.add(model);
  });

  box.moveTo = function (position) {
    let start = box.position.clone();
    let target = position.clone();
    target.y = start.y;

    let speed = 400;

    let distance = start.distanceTo(target);
    let direction = new THREE.Vector3();
    direction.subVectors(start, target).normalize();

    if (box.tween) box.tween.stop();

    box.lookAt(target);
    box.model?.mixer.stopAllAction();
    box.model?.animations.walk.play();

    box.tween = new TWEEN.Tween(start)
      .delay(0)
      .to(target, (distance * 1000) / (speed / 100))
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(function (position, progress) {
        let originPoint = box.position.clone();
        var directionVector = new THREE.Vector3();
        directionVector.subVectors(target, start).normalize();

        var ray = new THREE.Raycaster(
          originPoint,
          directionVector.clone().normalize()
        );

        var collisionResults = ray.intersectObjects(collidable, true);
        if (
          collisionResults.length > 0 &&
          collisionResults[0].distance < directionVector.length()
        ) {
          console.log(collisionResults[0]);
          box.material.color = new THREE.Color(0xf9ff47);
          box.tween.stop();
          if (targetPointer) targetPointer.removeFromParent();
          box.model?.mixer.stopAllAction();
              box.model?.animations.idle.play();
        } else {
          box.material.color = new THREE.Color(0x4287f5);
          box.position.copy(position);
          updateLine();
        }
      })
      .onComplete(function () {
        if (targetPointer) targetPointer.removeFromParent();
        box.model?.mixer.stopAllAction();
            box.model?.animations.idle.play();
      })
      .start();
  };

  scene.add(box);

  const points = [box.position, pointer.position];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 20,
  });
  const line = new THREE.Line(geometry);
  lineMaterial.polygonOffset = true;
  lineMaterial.polygonOffsetFactor = -0.2;
  scene.add(line);

  // Fonction pour mettre à jour la ligne
  function updateLine() {
    let start = box.position.clone();
    let target = pointer.position.clone();
    start.y = target.y;
    points[0] = start; // Position du joueur
    points[1] = target; // Position du curseur
    line.geometry.setFromPoints(points); // Mettre à jour la géométrie de la ligne
  }

  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(8, 5, 1),
    new THREE.MeshBasicMaterial({ color: 0xfff4ee, wireframe: true })
  );

  wall.position.set(4, 2.5, 3.5);

  const loader = new GLTFLoader();
  loader.load(`assets/wall/scene.gltf`, function (m) {
    let model = m.scene;
    model.scale.set(0.005, 0.005, 0.005);
    model.position.set(0, -2.1, 0.4);
    console.log(model);
    wall.add(model);
  });

  scene.add(wall);
  collidable.push(wall);

  const clock = new THREE.Clock(true);
  clock.start();
  const light = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(light);

  document.addEventListener("mousedown", box.setMoving);
  document.addEventListener("mousemove", setCursor);
  document.addEventListener("keypress", setOuterView);

  function animate() {
    controls.update();

    TWEEN.update();
    box?.model?.mixer.update(clock.getDelta());
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
})();
