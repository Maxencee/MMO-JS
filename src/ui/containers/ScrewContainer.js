import UI from "../../classes/UI";

export default function (children) {
    return UI.element(
        'div',
        {
            class: "w-full relative flex items-center gap-2 screw-container px-12 py-6"
        },
        children
    );
}