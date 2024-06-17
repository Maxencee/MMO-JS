import UI from "../classes/UI";

export default function (children) {
    return UI.element(
        'div',
        {
            class: "absolute w-10/12 absolute-center-x bottom-8 flex items-center gap-2 screw-container px-16 py-8"
        },
        children
    );
}