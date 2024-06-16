import PlayerCamera from "./src/PlayerCamera";
import Process from "./src/classes/Process";
import SandboxScene from "./src/scenes/SandboxScene";

("use strict");
(async function () {
  document.addEventListener("contextmenu", (evt) => evt.preventDefault());
  document.addEventListener("wheel", (evt) => {
    if(Process.camera) Process.camera.zoomTo(-Math.sign(evt.deltaY));
  });

  Process.showStats();

  new Process({
    scene: new SandboxScene(0x1b1b1b),
    camera: new PlayerCamera(),
  }).render();
})();
