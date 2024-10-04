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
  
  Process.showStats();
  BoundingBox.setMode('hidden');

  // First scene of the game -> home screen;

  const _PROCESS = new Process;

  if(window.location.search === "" || window.location.search === "?" || window.location.search === '?sandbox') {
    Process.setCamera(new PlayerCamera);
    Process.setScene(new SandboxScene());
  } else if (window.location.search === '?mapping') {
    Process.setCamera(new ControlCamera);
    Process.setScene(new DesignScene());
  }

  _PROCESS.render();
})();
