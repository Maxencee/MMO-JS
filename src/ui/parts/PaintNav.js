import UI from "../../classes/UI";
import ScrewContainer from "../containers/ScrewContainer";

const colors = {
    "soft_blue": [0x5462FF, "#5462FF"],
    "pastel_red": [0xFF6961, "#FF6961"],
    "mint_green": [0x98FF98, "#98FF98"],
    "sunshine_yellow": [0xFFD700, "#FFD700"],
    "sky_blue": [0x87CEEB, "#87CEEB"],
    "lavender": [0xE6E6FA, "#E6E6FA"],
    "midnight_black": [0x2C3E50, "#2C3E50"],
    "pure_white": [0xFFFFFF, "#FFFFFF"],
    "slate_gray": [0x708090, "#708090"],
    "coral": [0xFF7F50, "#FF7F50"],
    "blush_pink": [0xFFB6C1, "#FFB6C1"],
    "royal_purple": [0x7851A9, "#7851A9"],
    "chocolate_brown": [0xD2691E, "#D2691E"],
    "lime_green": [0x32CD32, "#32CD32"],
    "olive_drab": [0x6B8E23, "#6B8E23"],
    "deep_navy": [0x000080, "#000080"],
    "turquoise": [0x40E0D0, "#40E0D0"],
    "burgundy": [0x800020, "#800020"],
    "platinum_silver": [0xE5E4E2, "#E5E4E2"],
    "amber_gold": [0xFFBF00, "#FFBF00"]
  }

// https://github.com/yairEO/color-picker ?

export default ScrewContainer([
    UI.element('div', {
        class: "flex flex-col gap-4 w-full"
    }, [
        UI.element('h1', {
            class: 'font-bold text-xl text-neutral-600'
        }, [
            'Painting'
        ]),
        UI.element('div', {
            class: "flex flex-wrap gap-2"
        }, Object.entries(colors).map(([name, value]) => {
            return UI.element('span', {
                class: `w-8 h-8 block rounded border-solid border-1 cursor-pointer paint-choice`,
                title: name,
                'data-color': value[0],
                'style': `background: ${value[1]}; border-color: #47474765`
            }, [])
        }), {
            click: (evt) => UI.modules.changeColor(evt)
        })
    ])
])