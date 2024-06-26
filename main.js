import IdleCamera from "./src/props/IdleCamera";
import PlayerCamera from "./src/props/PlayerCamera";
import Process from "./src/classes/Process";
import CustomisationScene from "./src/scenes/CustomisationScene";
import SandboxScene from "./src/scenes/SandboxScene";
import UI from "./src/classes/UI";
import BoundingBox from "./src/entities/BoundingBox";

("use strict");
(async function () {
  document.addEventListener("contextmenu", (evt) => evt.preventDefault());

  UI.init();
  Process.showStats();
  BoundingBox.setMode('hidden');

  // First scene of the game -> home screen;

  const _PROCESS = new Process;
  Process.setCamera(new IdleCamera);
  Process.setScene(new CustomisationScene(0x6e6e6e));

  // Process.setCamera(new PlayerCamera);
  // Process.setScene(new SandboxScene(0x1b1b1b));

  _PROCESS.render();
})();
