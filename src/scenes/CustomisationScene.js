import BoundingBox from "../entities/BoundingBox";
import LightEnvironment from "../entities/LightEnvironment";
import Process from "../classes/Process";

import SandboxScene from "./SandboxScene";
import PlayerCamera from "../props/PlayerCamera";

import {
  BoxGeometry,
  Color,
  LinearToneMapping,
  Mesh,
  MeshBasicMaterial,
  NeutralToneMapping,
  RepeatWrapping,
  Scene,
  TextureLoader,
} from "three";
import PlayerStatic from "../props/PlayerStatic";
import UI from "../classes/UI";
import ScrewContainer from "../ui/ScrewContainer";
import MountingPart from "../props/MountingPart";
import { randInt } from "three/src/math/MathUtils.js";

export default class CustomisationScene extends Scene {
  constructor(backgroundColor) {
    super(backgroundColor);

    this.add(new LightEnvironment(0xffffff, 3));

    const model = new PlayerStatic();
    Process.camera.lookAt(model.position);

    this.add(model);

    const floor = new Mesh(
      new BoxGeometry(60, 1, 60),
      new MeshBasicMaterial({
        color: 0x0e0e0f,
      })
    );

    floor.position.set(0, -0.5, 0);
    this.add(floor);

    function loadTexture(name) {
      const texture = new TextureLoader().load(
        `assets/sprites/skins/${name}.png`
      );
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(3, 3);
      texture.mapping = NeutralToneMapping;
      model.mainMaterial.map = texture;
      model.mainMaterial.color.set(0x383838);
      model.mainMaterial.needsUpdate = true;

      model.playAction(!randInt(0, 9) ? 'jump' : 'yes');
    }


    UI.add(
      ScrewContainer([
        UI.element("span", {}, ["NeonShooter"], {
          click: () => loadTexture("neonshooter"),
        }),
        UI.element("span", {}, ["RedBlood"], {
          click: () => loadTexture("redblood"),
        }),
        UI.element("span", {}, ["Toxified"], {
          click: () => loadTexture("toxified"),
        }),
        UI.element("span", {}, ["Wireframe"], {
          click: () => loadTexture("wireframe"),
        }),
        UI.element("span", {}, ["Snakelines"], {
          click: () => loadTexture("snakelines"),
        }),
        UI.element("span", {}, ["Warrior"], {
          click: () => loadTexture("warrior"),
        }),
        UI.element("span", {}, ["Mount"], {
          click: () =>{
            model.mountSlots.upgradeHead.children.forEach((child) => {
              model.mountSlots.upgradeHead.remove(child);
            });
            model.mountSlots.upgradeHead.add(
              new MountingPart("gatling", model.accentGreyMaterial)
            )  
          },
        }),
        UI.element("span", {}, ["Color"], {
          click: () => {
            model.accentMaterial.emissive = new Color().setHex(
              Math.random() * 0xffffff
            );
            model.mainMaterial.emissive = new Color().setHex(
                Math.random() * 0xffffff
              );
            model.accentGreyMaterial.emissive = new Color().setHex(
              Math.random() * 0xffffff
            );
          },
        }),
      ]),
    );

    UI.add(
            // Create a screw container with the play button and change the scene to the sandbox scene
            UI.element(
              "div",
              {
                //center the cointainer to the top
                class: "absolute w-10/12 absolute-center-x top-8 flex items-center gap-2 screw-container px-16 py-8",
              },
              [
                UI.element(
                  "button",
                  {
                    class: "button button-primary",
                  },
                  ["Play"],
                  {
                    click: () => {
                      Process.setCamera(new PlayerCamera);
                      Process.setScene(new SandboxScene(0x1b1b1b));
                      // remove the screw container
                      console.log(UI.clear());
                    },
                  }
                ),
              ]
            )
    )
  }
}
