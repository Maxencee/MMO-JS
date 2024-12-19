import './styles/index.css';
import Process from "./modules/runtime/Process";
import Index from "./modules/scenes/Index";
import Open from './modules/scenes/Open';

(async function () {
  document.addEventListener("contextmenu", (evt) => evt.preventDefault());

  const _PROCESS_ = new Process;
  
  Process.setScene(new Index);

  _PROCESS_.render();
})();
