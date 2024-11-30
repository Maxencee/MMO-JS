import Process from "./src/runtime/Process";
import Index from "./src/scenes/Index";

("use strict");
(async function () {
  document.addEventListener("contextmenu", (evt) => evt.preventDefault());

  const _PROCESS_ = new Process;
  
  Process.setScene(new Index);

  _PROCESS_.render();
})();
