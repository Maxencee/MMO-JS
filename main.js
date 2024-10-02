import PlayerCamera from "./src/props/PlayerCamera";
import Process from "./src/classes/Process";
import SandboxScene from "./src/scenes/SandboxScene";
import UI from "./src/classes/UI";
import BoundingBox from "./src/entities/BoundingBox";
import ControlCamera from "./src/props/ControlCamera";
import DesignScene from "./src/scenes/DesignScene";

("use strict");
(async function () {
  document.addEventListener("contextmenu", (evt) => evt.preventDefault());

  UI.init();
  Process.showStats();
  BoundingBox.setMode('hidden');

  // First scene of the game -> home screen;

  const _PROCESS = new Process;
  Process.setCamera(new ControlCamera);
  Process.setScene(new DesignScene());

  _PROCESS.render();
})();
