import { FormModalUiHandler } from "./form-modal-ui-handler";
import { ModalConfig } from "./modal-ui-handler";
import i18next from "i18next";
import { PlayerPokemon } from "#app/field/pokemon.js";
import { OptionSelectItem } from "./abstact-option-select-ui-handler";
import { isNullOrUndefined } from "#app/utils";
import { enConfig } from "#app/locales/en/config";
import { Mode } from "./ui";

export default class RenameFormUiHandler extends FormModalUiHandler {
  keys: string[];
  pokemonKeys: string[];

  constructor(scene, mode) {
    super(scene, mode);
  }

  setup() {
    super.setup();

    // const pokemonValues = (object):Array<any> => {
    //   return Object.values(object).map((t,i)=>{
    //     if (typeof t !== "string" && typeof t === "object") {
    //       return pokemonValues(t).filter((t)=> t.length > 0);
    //     } else if (typeof t === "string"){
    //       return t;
    //     };
    //   }).filter((t)=> t);
    // }

    const keysContainPokemon = (object, topKey?: string, midleKey?: string[]): Array<any> => {
      return Object.keys(object).map((t, i) => {
        const value = Object.values(object)[i];

        if (typeof value === "object") {
          // If the value is an object, execute the same process
          // si el valor es un objeto ejecuta el mismo proceso

          return keysContainPokemon(value, topKey ?? t, topKey ? midleKey ? [...midleKey, t] : [t] : undefined).filter((t) => t.length > 0);
        } else if (typeof value === "string" && (value.toLowerCase().includes("pokemon") || t.toLowerCase().includes("dialogue") || t.toLowerCase().includes("dialogue") || topKey?.toLowerCase().includes("dialogue"))) {
          // Otherwise, collect objects with keys that include "dialogue"
          // and values that include "pokemon" to bring either "{{pokemon}}" or {{pokemonWithAffix}}

          // Return in the format expected by i18next
          return midleKey ? `${topKey}:${midleKey.map((m) => m).join(".")}.${t}` : `${topKey}:${t}`;
        }
      }).filter((t) => t);
    };

    const keysInArrays = keysContainPokemon(enConfig).filter((t) => t.length > 0); // Array of arrays
    const keys = keysInArrays.flat(Infinity).map(String); // One array of string
    this.keys = keys;


    const pokemonKeysCollect = (object, topKey?: string): Array<any> => {
      return Object.keys(object).map((t, i) => {
        const value = Object.values(object)[i];

        if (typeof value !== "string" && typeof value === "object") {
          return pokemonKeysCollect(value, t).filter((t) => t.length > 0);
        } else if (typeof value === "string" && ["pokemon"].some((v) => topKey?.toLowerCase() === v)) {
          return `${topKey}:${t}`;
        }
      }).filter((t) => t);
    };

    const pokemon = pokemonKeysCollect(enConfig);
    const pokemonKeys = pokemon.flat(Infinity).map(String);

    this.pokemonKeys = pokemonKeys;

    this.inputs[0].setMaxLength(100);
  }

  getModalTitle(config?: ModalConfig): string {
    return i18next.t("menu:renamePokemon");
  }

  getFields(config?: ModalConfig): string[] {
    return [i18next.t("menu:nickname")];
  }

  getWidth(config?: ModalConfig): number {
    return 160;
  }

  getMargin(config?: ModalConfig): [number, number, number, number] {
    return [0, 0, 48, 0];
  }

  getButtonLabels(config?: ModalConfig): string[] {
    return [i18next.t("menu:rename"), i18next.t("menu:cancel")];
  }

  getReadableErrorMessage(error: string): string {
    const colonIndex = error?.indexOf(":");
    if (colonIndex > 0) {
      error = error.slice(0, colonIndex);
    }

    return super.getReadableErrorMessage(error);
  }

  show(args: any[]): boolean {
    const ui = this.getUi();
    const input = this.inputs[0];

    input.on("keydown", (inputObject, evt: KeyboardEvent) => {
      if (["escape", "space"].some((v) => v === evt.key.toLowerCase() || v === evt.code.toLowerCase()) && ui.getMode() === Mode.AUTO_COMPLETE) {
        // Delete autocomplete list and recovery focus.
        inputObject.on("blur", () => inputObject.node.focus(), { once: true });
        ui.revertMode();
      }
    });

    input.on("textchange", (inputObject, evt: InputEvent) => {
      // Delete autocomplete.
      if (ui.getMode() === Mode.AUTO_COMPLETE) {
        ui.revertMode();
      }

      const filteredOptions = this.keys.filter((command) => command.toLowerCase().includes(inputObject.text.toLowerCase()));
      if (inputObject.text !== "" && filteredOptions.length > 0) {

        // Limit the options that are rendered because if not, it won't show anything since there can be over 800-1500 options.
        const options: OptionSelectItem[] = filteredOptions.slice(0, 100).map((value) => {
          return {
            label: value,
            handler: () => {
              if (!isNullOrUndefined(evt.data)) {
                inputObject.setText(value);
              }
              ui.revertMode();
              return true;
            }
          };
        });
        const modalOpts = {
          options: options,
          maxOptions: 5,
          modalContainer: this.modalContainer
        };
        ui.setOverlayMode(Mode.AUTO_COMPLETE, modalOpts);
      }

    });

    if (super.show(args)) {
      const config = args[0] as ModalConfig;
      if (args[1] && typeof (args[1] as PlayerPokemon).getNameToRender === "function") {
        this.inputs[0].text = (args[1] as PlayerPokemon).getNameToRender();
      } else {
        this.inputs[0].text = args[1];
      }
      this.submitAction = (_) => {
        if (ui.getMode() === Mode.RENAME_POKEMON) {
          this.sanitizeInputs();
          const sanitizedName = btoa(unescape(encodeURIComponent(this.inputs[0].text)));
          config.buttonActions[0](sanitizedName);
          console.log(i18next.t(input.text.split(" ")[0], { pokemonName: "Bulbasaur" }));
          return true;
        }
        return false;
      };
      return true;
    }
    return false;
  }

}
