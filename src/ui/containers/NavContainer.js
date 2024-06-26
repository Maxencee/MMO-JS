import Process from "../../classes/Process";
import UI from "../../classes/UI";
import PlayerCamera from "../../props/PlayerCamera";
import SandboxScene from "../../scenes/SandboxScene";
import PaintNav from "../parts/PaintNav";
import TextureNav from "../parts/TextureNav";
import UpgradeNav from "../parts/UpgradeNav";
import ScrewContainer from "./ScrewContainer";

export default UI.element('div', {
    class: "flex flex-col items-center gap-y-4 w-1/3 h-dvh p-3"
},
[
    PaintNav,
    TextureNav,
    UpgradeNav,
    ScrewContainer([
        UI.element('button', {
            class: "group relative h-12 w-full overflow-hidden rounded-2xl bg-green-500 text-lg font-bold text-white"
        }, [
            UI.element('div', {
                class: "absolute inset-0 h-full w-full scale-0 rounded-2xl transition-all duration-300 group-hover:scale-100 group-hover:bg-white/30"
            }),
            "Play"
        ], {
            click: () => {
                Process.setCamera(new PlayerCamera);
                Process.setScene(new SandboxScene(0x1b1b1b));
                UI.clear();
            }
        })  
    ])
])