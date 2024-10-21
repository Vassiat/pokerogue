import { Button } from "#app/enums/buttons";
import { poketchOptions } from "#app/enums/poketch";
import { poketchHandler } from "./abstract-poketch-handler";

export class coinFlip extends poketchHandler {

  constructor(scene) {
    super(scene, poketchOptions.COIN_FLIP, "Coin Flip");
    this.selectable = false;
  }

  processInput(button: Button): boolean {
    return false;
  }
}
