import { FormModalUiHandler } from "./form-modal-ui-handler";
import { ModalConfig } from "./modal-ui-handler";
import i18next from "i18next";
import { PlayerPokemon } from "#app/field/pokemon.js";
import { Mode } from "./ui";
import { OptionSelectConfig, OptionSelectItem } from "./abstact-option-select-ui-handler";
import { addWindow } from "./ui-theme";
import { addTextObject, getTextStyleOptions, TextStyle } from "./text";
import InputText from "phaser3-rex-plugins/plugins/inputtext";
import BattleScene from "#app/battle-scene.js";
import AutoCompleteUiHandler from "./autocomplete-ui-handler";

const emojiAvailable = ["♪", "★", "♥", "♣", "☻", "ª", "☼", "►", "♫", "←", "→"];

export default class RenameFormUiHandler extends FormModalUiHandler {
  protected autocomplete: AutoCompleteUiHandler;

  getModalTitle(config?: ModalConfig): string {
    return i18next.t("menu:renamePokemon");
  }

  getFields(config?: ModalConfig): string[] {
    return [ i18next.t("menu:nickname") ];
  }

  getWidth(config?: ModalConfig): number {
    return 160;
  }

  getMargin(config?: ModalConfig): [number, number, number, number] {
    return [ 0, 0, 48, 0 ];
  }

  getButtonLabels(config?: ModalConfig): string[] {
    return [ i18next.t("menu:rename"), i18next.t("menu:cancel") ];
  }

  getReadableErrorMessage(error: string): string {
    const colonIndex = error?.indexOf(":");
    if (colonIndex > 0) {
      error = error.slice(0, colonIndex);
    }

    return super.getReadableErrorMessage(error);
  }

  setup(): void {
    super.setup();
    const helpEmojiListContainer = this.scene.add.container(0, this.getHeight());
    const helpEmojiListBg = addWindow(this.scene, 0, 0, this.getWidth(), 52);
    helpEmojiListContainer.add(helpEmojiListBg);
    const scale = getTextStyleOptions(TextStyle.WINDOW, (this.scene as BattleScene).uiTheme).scale ?? 0.1666666667;

    const helpEmojiListText = addTextObject(this.scene, 8, 8, i18next.t("menu:renameHelpEmoji"), TextStyle.TOOLTIP_CONTENT, {
      fontSize: "80px",
    });
    helpEmojiListText.setWordWrapWidth(this.modalContainer.getBounds().width * 0.95);
    const height = ((Math.min((helpEmojiListText.getWrappedText(helpEmojiListText.text) || []).length, 99)) * 96 * scale) + helpEmojiListText.y;
    helpEmojiListBg.setSize(helpEmojiListBg.width, height);

    helpEmojiListContainer.add(helpEmojiListText);

    this.modalContainer.add(helpEmojiListContainer);
  }

  show(args: any[]): boolean {
    if (super.show(args)) {
      const ui = this.getUi();
      const input = this.inputs[0];

      // rename config
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
          return true;
        }
      };
      const originalCancel = config.buttonActions[1];
      config.buttonActions[1] = ()=>{
        if (ui.getMode() === Mode.RENAME_POKEMON) {
          originalCancel();
        }
      };

      const maxEmojis = 6;

      const emojiOptions = emojiAvailable.map((emoji, index): OptionSelectItem => {
        return {
          label: `${emoji} /${index + 1}`,
          handler: ()=> {
            const command = input.text.split("").filter((_, i) => i >= (input.text.split("").filter((_, i) => i < input.cursorPosition).lastIndexOf("/")) && i < input.cursorPosition).join("");

            const texto = input.text;
            const textBeforeCursor = texto.substring(0, input.cursorPosition);
            const textAfterCursor = texto.substring(input.cursorPosition);

            const exactlyCommand = textBeforeCursor.lastIndexOf(command);
            if (exactlyCommand !== -1) {
              const textReplace = textBeforeCursor.substring(0, exactlyCommand) + emoji + textAfterCursor;
              input.setText(textReplace);
              input.setCursorPosition(exactlyCommand + emoji.length);
              return true;
            }
            return false;
          },
        };
      });

      interface OptionSelectConfigAC extends OptionSelectConfig {
        inputContainer: Phaser.GameObjects.Container;
        modalContainer: Phaser.GameObjects.Container;
      }

      const modalOptions = {
        options: emojiOptions,
        modalContainer: this.modalContainer,
        inputContainer: this.inputContainers[0],
        maxOptions: 5
      };

      input.on("textchange", (inputObject:InputText, evt:InputEvent) => {
        if (input.text.split("").filter((char) => emojiAvailable.some((em) => em === char)).length < maxEmojis && input.text.split("").some((char, i) => char === "/" && i + 1 === input.cursorPosition) && input.text.length < input.maxLength) {
          ui.setOverlayMode(Mode.AUTO_COMPLETE, modalOptions);
        }

        if (input.text.split("").filter((char) => emojiAvailable.some((em) => em === char)).length > maxEmojis) {
          const command = input.text.split("").filter((_, i) => evt.data && i >= (input.text.split("").filter((_, i) => i < input.cursorPosition).lastIndexOf(evt.data)) && i < input.cursorPosition).join("");

          const texto = input.text;
          const textBeforeCursor = texto.substring(0, input.cursorPosition);
          const textAfterCursor = texto.substring(input.cursorPosition);

          const exactlyCommand = textBeforeCursor.lastIndexOf(command);
          if (exactlyCommand !== -1 && evt.data) {
            const textReplace = textBeforeCursor.substring(0, exactlyCommand) + textAfterCursor;
            if (textReplace !== input.text) {
              input.setText(textReplace);
              input.setCursorPosition(exactlyCommand);
            }
          }
        }
        if (evt.data && input.text.split("").filter((char) => emojiAvailable.some((em) => em === char)).length < maxEmojis) {
          if (evt.data === "/") {
            ui.setOverlayMode(Mode.AUTO_COMPLETE, modalOptions);
          }
        }
      });

      input.on("keydown", (inputObject:InputText, evt:KeyboardEvent)=>{
        const command = input.text.split("").filter((_, i) => i >= (input.text.split("").filter((_, i) => i < input.cursorPosition).lastIndexOf("/")) && i < input.cursorPosition).join("");
        if (!isNaN(parseInt(evt.key))) {
          input.setData("filter", input.getData("filter") ? input.getData("filter").toString().concat(evt.key) : evt.key.toString());
        } else {
          input.setData("filter");
        }
        if (command.includes("/") && emojiOptions.some((_, i) => (i + 1).toString().includes(input.getData("filter")))) {
          const filterOptions: OptionSelectConfigAC = {
            options: emojiOptions.filter((_, i) => (i + 1).toString().includes(input.getData("filter"))),
            modalContainer: this.modalContainer,
            inputContainer: this.inputContainers[0],
            maxOptions: 5
          };

          this.scene.ui.setOverlayMode(Mode.AUTO_COMPLETE, filterOptions);
        }
      });

      return true;
    }
    return false;
  }
}
