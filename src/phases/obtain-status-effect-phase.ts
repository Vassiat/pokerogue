import BattleScene from "#app/battle-scene";
import { BattlerIndex } from "#app/battle";
import { CommonBattleAnim, CommonAnim } from "#app/data/battle-anims";
import { getStatusEffectObtainText, getStatusEffectOverlapText } from "#app/data/status-effect";
import { StatusEffect } from "#app/enums/status-effect";
import Pokemon from "#app/field/pokemon";
import { getPokemonNameWithAffix } from "#app/messages";
import { PokemonPhase } from "./pokemon-phase";

export class ObtainStatusEffectPhase extends PokemonPhase {
  private statusEffect?: StatusEffect | undefined;
  private cureTurn?: integer | null;
  private sourceText?: string | null;
  private sourcePokemon?: Pokemon | null;

  constructor(scene: BattleScene, battlerIndex: BattlerIndex, statusEffect?: StatusEffect, cureTurn?: integer | null, sourceText?: string | null, sourcePokemon?: Pokemon | null) {
    super(scene, battlerIndex);

    this.statusEffect = statusEffect;
    this.cureTurn = cureTurn;
    this.sourceText = sourceText;
    this.sourcePokemon = sourcePokemon; // For tracking which Pokemon caused the status effect
  }

  start() {
    const pokemon = this.getPokemon();
    if (pokemon && !pokemon.status) {
      if (pokemon.trySetStatus(this.statusEffect, false, this.sourcePokemon)) {
        if (this.cureTurn) {
          pokemon.status!.cureTurn = this.cureTurn; // TODO: is this bang correct?
        }
        pokemon.updateInfo(true);
        new CommonBattleAnim(CommonAnim.POISON + (this.statusEffect! - 1), pokemon).play(this.scene, false, () => {
          this.scene.queueMessage(getStatusEffectObtainText(this.statusEffect, getPokemonNameWithAffix(pokemon), this.sourceText ?? undefined));
          this.end();
        });
        return;
      }
    } else if (pokemon.status?.effect === this.statusEffect) {
      this.scene.queueMessage(getStatusEffectOverlapText(this.statusEffect ?? StatusEffect.NONE, getPokemonNameWithAffix(pokemon)));
    }
    this.end();
  }
}
