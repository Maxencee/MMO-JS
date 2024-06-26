import LightEnvironment from "../entities/LightEnvironment";
import Process from "../classes/Process";
import {
  BoxGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  RepeatWrapping,
  Scene,
  SubtractEquation,
  TextureLoader,
  UVMapping,
  Vector3,
} from "three";
import PlayerStatic from "../props/PlayerStatic";
import { randInt } from "three/src/math/MathUtils.js";
import UI from "../classes/UI";
import NavContainer from "../ui/containers/NavContainer";
import MountingPart from "../props/MountingPart";

export default class CustomisationScene extends Scene {
  constructor(backgroundColor) {
    super(backgroundColor);

    this.add(new LightEnvironment(0xffffff, 3));

    const model = new PlayerStatic();
    Process.camera.lookAt(model.position);

    model.position.add(new Vector3(0.5, 0, 0));

    this.add(model);

    const floor = new Mesh(
      new BoxGeometry(60, 1, 60),
      new MeshBasicMaterial({
        color: 0x0e0e0f,
      })
    );

    floor.position.set(0, -0.5, 0);
    this.add(floor);

    UI.modules.changeColor = function (event) {
      let target = event.target.closest('.paint-choice');
      if(!target) return;

      model.accentMaterial.emissive = new Color().setHex(target.dataset.color);
      model.eyeMaterial.color = new Color().setHex(target.dataset.color);
      model.accentGreyMaterial.emissive = new Color().setHex(target.dataset.color).multiplyScalar(2);
    }

    UI.modules.changeTexture = function (event) {
      let target = event.target.closest('.texture-choice');
      if(!target) return;

      if(target.dataset.texture === "none") {
        model.mainMaterial.map = null;
        model.mainMaterial.color.set(0x090909);
      }

      const texture = new TextureLoader().load(
        `assets/sprites/skins/${target.dataset.texture}.png`
      );

      // texture.wrapS = RepeatWrapping;
      // texture.wrapT = RepeatWrapping;
      // texture.repeat.set(3, 3);
      texture.mapping = UVMapping;
      model.mainMaterial.map = texture;
      model.mainMaterial.color.set(0x858585);
      model.mainMaterial.needsUpdate = true;
  
      model.playAction(!randInt(0, 9) ? 'jump' : 'yes');
    }
    
    UI.modules.mountUpgrade = function (event) {
      let target = event.target.closest('.upgrade-choice');
      if(!target) return;

      model.mountSlots['upgradeHead'].children[0]?.removeFromParent();
      if(target.dataset.part == 'none') return;
      model.mountSlots['upgradeHead'].add(new MountingPart(target.dataset.part, model.accentGreyMaterial));

      model.playAction(!randInt(0, 1) ? 'punch' : 'shoot');
    }

    UI.add(NavContainer, 'navContainer');
  }
}
