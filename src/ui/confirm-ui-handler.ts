import type { OptionSelectConfig } from "./abstact-option-select-ui-handler";
import AbstractOptionSelectUiHandler from "./abstact-option-select-ui-handler";
import { Mode } from "./ui";
import i18next from "i18next";
import { Button } from "#enums/buttons";
import { globalScene } from "#app/global-scene";

type ConfirmConfig =
  | [
      () => void, // onSummary
      () => void, // onPokedex
      () => void, // onYesFullParty
      () => void, // onNoFullParty
      "fullParty",
      (boolean | null)?, // switchCheck (optional)
      (number | null)?, // xOffset (optional)
      (number | null)?, // yOffset (optional)
      (number | null)?, // delay (optional)
    ]
  | [
      () => void, // onYes
      () => void, // onNo
      (boolean | null)?, // switchCheck (optional)
      (number | null)?, // xOffset (optional)
      (number | null)?, // yOffset (optional)
      (number | null)?, // delay (optional)
      boolean?, // noCancel (optional)
    ];

export default class ConfirmUiHandler extends AbstractOptionSelectUiHandler {
  public static readonly windowWidth: number = 48;

  private switchCheck: boolean;
  private switchCheckCursor: number;

  constructor() {
    super(Mode.CONFIRM);
  }

  getWindowWidth(): number {
    return ConfirmUiHandler.windowWidth;
  }

  show(
    ...args: [Omit<OptionSelectConfig, "options" | "maxOptions" | "noCancel" | "supportHover">, ConfirmConfig]
  ): boolean {
    if (
      args.length === 5 &&
      args[0] instanceof Function &&
      args[1] instanceof Function &&
      args[2] instanceof Function &&
      args[3] instanceof Function &&
      args[4] === "fullParty"
    ) {
      const config: OptionSelectConfig = {
        options: [
          {
            label: i18next.t("partyUiHandler:SUMMARY"),
            handler: () => {
              args[0]();
              return true;
            },
          },
          {
            label: i18next.t("partyUiHandler:POKEDEX"),
            handler: () => {
              args[1]();
              return true;
            },
          },
          {
            label: i18next.t("menu:yes"),
            handler: () => {
              args[2]();
              return true;
            },
          },
          {
            label: i18next.t("menu:no"),
            handler: () => {
              args[3]();
              return true;
            },
          },
        ],
        delay: args.length >= 9 && args[8] !== null ? args[8] : 0,
      };

      super.show(config);

      this.switchCheck = args.length >= 6 && typeof args[5] === "boolean" && args[5];

      const xOffset: number = args.length >= 7 && typeof args[6] === "number" ? args[6] : 0;
      const yOffset: number = args.length >= 8 && typeof args[7] === "number" ? args[7] : 0;

      this.optionSelectContainer.setPosition(globalScene.game.canvas.width / 6 - 1 + xOffset, -48 + yOffset);

      this.setCursor(this.switchCheck ? this.switchCheckCursor : 0);
      return true;
    }
    if (args.length >= 2 && args[0] instanceof Function && args[1] instanceof Function) {
      const config: OptionSelectConfig = {
        options: [
          {
            label: i18next.t("menu:yes"),
            handler: () => {
              args[0]();
              return true;
            },
          },
          {
            label: i18next.t("menu:no"),
            handler: () => {
              args[1]();
              return true;
            },
          },
        ],
        delay: args.length >= 6 && typeof args[5] === "number" ? args[5] : 0,
        noCancel: args.length >= 7 && typeof args[6] === "boolean" ? args[6] : false,
      };

      super.show(config);

      this.switchCheck = args.length >= 3 && typeof args[2] === "boolean" && args[2];

      const xOffset: number = args.length >= 4 && typeof args[3] === "number" ? args[3] : 0;
      const yOffset: number = args.length >= 5 && typeof args[4] === "number" ? args[4] : 0;

      this.optionSelectContainer.setPosition(globalScene.game.canvas.width / 6 - 1 + xOffset, -48 + yOffset);

      this.setCursor(this.switchCheck ? this.switchCheckCursor : 0);

      return true;
    }
    return false;
  }

  processInput(button: Button): boolean {
    if (button === Button.CANCEL && this.blockInput && !this.config?.noCancel) {
      this.unblockInput();
    }

    return super.processInput(button);
  }

  setCursor(cursor: number): boolean {
    const ret = super.setCursor(cursor);

    if (ret && this.switchCheck) {
      this.switchCheckCursor = this.cursor;
    }

    return ret;
  }
}
