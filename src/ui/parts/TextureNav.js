import UI from "../../classes/UI";
import ScrewContainer from "../containers/ScrewContainer";

const textures = [
  "snakelines","neonlover", "hi","none"
]

export default ScrewContainer([
  UI.element('div', {
      class: "flex flex-col gap-4 w-full"
  }, [
      UI.element('h1', {
          class: 'font-bold text-xl text-neutral-600'
      }, [
          'Texture'
      ]),
      UI.element('div', {
          class: "flex flex-wrap gap-2"
      }, textures.map(name => {
          return UI.element('span', {
              class: `w-8 h-8 block rounded border-solid border-1 cursor-pointer texture-choice bg-contain`,
              title: name,
              'data-texture': name,
              'style': `background-image: url('assets/sprites/skins/previews/${name}.png'); border-color: #47474765`
          }, [])
      }), {
          click: (evt) => UI.modules.changeTexture(evt)
      })
  ])
])