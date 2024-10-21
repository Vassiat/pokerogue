import BattleScene from "#app/battle-scene";
import { Button } from "#app/enums/buttons";
import { poketchOptions } from "#app/enums/poketch";

export abstract class poketchHandler {
  public scene: BattleScene;
  public id: poketchOptions;
  public name: poketchOptions;
  public selectable: boolean;
  public active: boolean = false;
  public title: string;

  constructor(scene, option: poketchOptions | null = null, title: string) {
    this.scene = scene;
    if (option) {
      this.id = option;
    }
    this.title = title;
  }

  abstract processInput(button: Button): boolean;
}
