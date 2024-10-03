import * as THREE from "three";
import Prop from "./Prop";

export default class PropDetail extends Prop {
  isCollidable = false;
  
  constructor(path, options = null) {
    super(path, options);
  }
}
