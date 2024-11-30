import './index.css';
import Process from "./runtime/Process";
import Index from "./scenes/Index";

(async function () {
  document.addEventListener("contextmenu", (evt) => evt.preventDefault());

  const _PROCESS_ = new Process;
  
  Process.setScene(new Index);

  _PROCESS_.render();
})();
