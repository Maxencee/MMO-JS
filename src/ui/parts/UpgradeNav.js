import UI from "../../classes/UI";
import ScrewContainer from "../containers/ScrewContainer";

const weapons = [
    "gatling","flame","cannon","rocket","none"
]

// https://github.com/yairEO/color-picker ?

export default ScrewContainer([
    UI.element('div', {
        class: "flex flex-col gap-4 w-full"
    }, [
        UI.element('h1', {
            class: 'font-bold text-xl text-neutral-600'
        }, [
            'Weapon'
        ]),
        UI.element('div', {
            class: "flex flex-wrap gap-2"
        }, weapons.map(name => {
            return UI.element('span', {
                class: `w-8 h-8 block rounded border-solid border-1 cursor-pointer upgrade-choice`,
                title: name,
                'data-part': name,
                'style': `background: red; border-color: #47474765`
            }, [])
        }), {
            click: (evt) => UI.modules.mountUpgrade(evt)
        })
    ])
])