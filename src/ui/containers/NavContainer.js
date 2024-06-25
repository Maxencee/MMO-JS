import UI from "../../classes/UI";
import PaintNav from "../parts/PaintNav";
import TextureNav from "../parts/TextureNav";
import UpgradeNav from "../parts/UpgradeNav";

export default UI.element('div', {
    class: "flex flex-col items-center gap-y-4 w-1/3 h-dvh p-3"
},
[
    PaintNav,
    TextureNav,
    UpgradeNav
])