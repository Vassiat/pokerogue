import { Button } from "#app/enums/buttons";
import { poketchOptions } from "#app/enums/poketch";
import { poketchHandler } from "./abstract-poketch-handler";

export class leaderHistory extends poketchHandler {

  constructor(scene) {
    super(scene, poketchOptions.LEADER_HISTORY, "Leader History");
    this.selectable = true;
  }

  processInput(button: Button): boolean {
    this.selectable = true;
    return false;
  }
}
