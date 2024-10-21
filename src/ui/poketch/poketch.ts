import BattleScene from "#app/battle-scene";
import { Button } from "#app/enums/buttons";
import { poketchOptions, ScreenColor } from "#app/enums/poketch";
import { addTextObject, TextStyle } from "../text";
import { addWindow } from "../ui-theme";
import { poketchHandler } from "./abstract-poketch-handler";
import { coinFlip } from "./coin-flip";
import { leaderHistory } from "./leader-history";

export class poketch extends Phaser.GameObjects.Container {
  protected bg: Phaser.GameObjects.NineSlice;
  protected tweens: Phaser.Tweens.Tween;
  protected tweensDelay: (Phaser.Time.TimerEvent | Phaser.Tweens.Tween)[] = [];

  protected titleLabel: Phaser.GameObjects.Text;

  private originalX: number;
  private originalY: number;
  private overlay: Phaser.GameObjects.Rectangle;
  private up: Phaser.GameObjects.Rectangle;
  private down: Phaser.GameObjects.Rectangle;
  private poketch: Phaser.GameObjects.Container;
  private screenContainer: Phaser.GameObjects.Container;
  private screenBox: Phaser.GameObjects.Rectangle;
  private watch: Phaser.GameObjects.Text;

  public isSelect: boolean = false;
  protected cursor: number = 0;
  protected options: poketchHandler[];
  protected option: poketchHandler;

  scene: BattleScene;
  width: number;
  height: number;

  constructor(scene: BattleScene, x: number, y: number, width?: number, height?: number) {
    super(scene, x, y);
    this.scene = scene;

    this.width = width ?? 0;
    this.height = height ?? 0;
    this.originalX = this.x;
    this.originalY = this.y;

    this.setup();
  }

  setup() {
    this.overlay = this.scene.add.rectangle(-(this.originalX + 1), -(this.y + 1), this.scene.game.canvas.width / 6, this.scene.game.canvas.height / 6, 0, 0.4);
    this.overlay.setName("rect-leader-history-overlay");
    this.overlay.setOrigin(0, 0);
    this.overlay.setVisible(false);
    this.add(this.overlay);

    this.options = [
      new leaderHistory(this.scene),
      new coinFlip(this.scene)
    ];

    this.option = this.options[0];

    this.poketch = this.scene.add.container(0, 0);
    this.bg = addWindow(this.scene, 0, 0, this.width, this.height);
    this.bg.setTint(Phaser.Display.Color.HexStringToColor("#fff").color);
    this.poketch.add(this.bg);

    this.screenContainer = this.scene.add.container(this.width / 3, this.bg.height / 4);
    this.screenBox = this.scene.add.rectangle(0, 0, this.bg.width / 4, this.bg.height / 2, ScreenColor.OFF);
    this.screenBox.setOrigin(0, 0);
    // 0x8ac489

    this.screenContainer.add(this.screenBox);
    this.poketch.add(this.screenContainer);

    this.titleLabel = addTextObject(this.scene, 2, 0, "", TextStyle.WINDOW);
    this.titleLabel.setShadow(0, 0);
    this.titleLabel.setVisible(false);
    this.titleLabel.setColor("#385030");
    this.titleLabel.setStroke("#385030", 3);

    this.watch = addTextObject(this.scene, 0, 0, "10:20", TextStyle.WINDOW);
    this.watch.setShadow(0, 0);
    this.watch.setVisible(false);
    this.watch.setColor("#385030");
    this.watch.setStroke("#385030", 3);

    this.up = this.scene.add.rectangle(0, 0, 0, 0, Phaser.Display.Color.HexStringToColor("#ff0000").color);
    this.down = this.scene.add.rectangle(0, 0, 0, 0, Phaser.Display.Color.HexStringToColor("#ff0000").color);
    this.defaultButtons();
    // this.up.setVisible(false);
    // this.down.setVisible(false);
    this.up.setOrigin(0, 0);
    this.down.setOrigin(0, 0);

    this.screenContainer.add(this.titleLabel);
    this.screenContainer.add(this.watch);
    this.poketch.add(this.up);
    this.poketch.add(this.down);
    this.add(this.poketch);

    const animationConfig = {
      targets: this.poketch,
      x: this.originalX - 2,
      duration: 5000,
      ease: "Cubic.easeIn",
      repeat: -1,
      yoyo: true,
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        const step = Math.floor(tween.elapsed / (tween.duration / 2));
        tween.duration = step % 2 ? 11000 : 5000;
      },
    };

    this.tweens = this.scene.tweens.add(animationConfig);

  }

  setWidth(width: number) {
    this.width = width;
    this.bg.setSize(width, this.height ?? 0);
    this.titleLabel.setPositionRelative(this.bg, this.bg.width / 2, 8);
  }

  setHeight(height: number) {
    this.height = height;
    this.bg.setSize(this.width ?? 0, height);
  }

  select() {
    if (this.isSelect) {
      return;
    }

    this.isSelect = true;
    this.tweens.pause();
    this.setX(this.originalX);
    this.parentContainer.bringToTop(this);
    this.overlay.setVisible(true);
    const paddingY = 8;
    const paddingX = 50;
    this.scene.tweens.add({
      targets: this.bg,
      width: this.scene.scaledCanvas.width - this.width + this.down.width + 2,
      height: (this.scene.scaledCanvas.height / 1.2) - (this.originalX + (paddingY * 2)),
      duration: 800,
      ease: "Quad.easeOut",
    });
    this.scene.tweens.add({
      targets: this.screenContainer,
      x: -(this.originalX - (paddingY * 2)),
      duration: 800,
      ease: "Quad.easeOut",
      onComplete: () => {
        const screenshot = this.scene.add.rectangle(this.screenBox.width / 2, this.screenBox.height / 2, 0, 0, Phaser.Display.Color.HexStringToColor("#fff").color);
        screenshot.setOrigin(0, 0);
        this.screenContainer.add(screenshot);
        this.scene.tweens.add({
          targets: screenshot,
          duration: 200,
          width: this.screenBox.width,
          height: this.screenBox.height,
          delay: 5,
          x: 0,
          y: 0,
          rotation: 0,
          ease: "Sine.easeOut",
          onComplete: () => {
            this.scene.time.delayedCall(100, () => {
              screenshot.destroy();
              this.screenBox.setFillStyle(ScreenColor.ON);
            });
          }
        });
      }
    });
    this.scene.tweens.add({
      targets: this.screenBox,
      width: (this.scene.scaledCanvas.width / 1.1) - this.width,
      height: (this.scene.scaledCanvas.height / 1.4) - (this.originalX + (paddingY * 2)),
      duration: 800,
      ease: "Quad.easeOut",
    });
    this.scene.tweens.add({
      targets: this.poketch,
      x: paddingX,
      y: (paddingY * 2) - this.y,
      duration: 800,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.watch.setX(this.screenBox.width - this.watch.displayWidth - 3);
        this.watch.setVisible(true);
        this.titleLabel.setVisible(true);
        this.titleLabel.setAlpha(0);
        this.watch.setAlpha(0);
        this.scene.tweens.add({
          targets: [ this.titleLabel, this.watch ],
          alpha: 1,
          delay: 100,
          duration: 200,
          ease: "Sine.easeOut",
        });
      }
    });
    this.scene.tweens.add({
      targets: [ this.up, this.down ],
      width: 10,
      x: this.width + paddingX + 20,
      height: (this.scene.scaledCanvas.height / 2) - (this.originalY + (paddingY * 2)),
      duration: 800,
      ease: "Sine.easeOut",
    });
    this.scene.tweens.add({
      targets: this.down,
      y: (this.scene.scaledCanvas.height / 2) - (this.originalY + (paddingY * 2)) + 25,
      duration: 800,
      ease: "Sine.easeOut",
    });
    this.scene.tweens.add({
      targets: this.up,
      y: 12,
      duration: 800,
      ease: "Sine.easeOut",
    });

    this.overlay.setAlpha(0);
    this.scene.tweens.add({
      targets: this.overlay,
      duration: 1000,
      alpha: 1,
      ease: "Sine.easeOut",
    });
    if (this.tweensDelay.length) {
      this.tweensDelay.forEach((timer) => {
        timer.destroy();
      });
    }
  }

  processInput(button: Button) {
    if (this.option.active) {
      if (button === Button.CANCEL) {
        this.option.active = false;
      }
      return this.option.processInput(button);
    } else if (!!this.option.selectable && button === Button.ACTION) {
      this.option.active = true;
    }

    let success = false;

    switch (button) {
    case Button.RIGHT:
    case Button.LEFT:
    case Button.CANCEL:
      success = true;
      this.clear();
      break;
    case Button.DOWN:
      this.setCursor(this.cursor + 1);
      this.down.setFillStyle(Phaser.Display.Color.HexStringToColor("#990033").color);
      break;
    case Button.UP:
      this.setCursor(this.cursor - 1);
      this.up.setFillStyle(Phaser.Display.Color.HexStringToColor("#990033").color);
      break;
    }
    return success;
  }

  /**
   * Set the cursor to the specified position.
   *
   * @param cursor - The cursor position to set.
   * @returns `true` if the cursor was set successfully.
   */
  setCursor(cursor: number): boolean {
    const changed = this.cursor !== cursor;
    const optionsLength = this.options.length;
    if (changed) {
      if (cursor < 0) {
        this.cursor = optionsLength;
      } else if (cursor > optionsLength) {
        this.cursor = 0;
      } else {
        this.cursor = cursor;
      }
    }

    this.setOption(this.cursor);

    return changed;
  }

  setOption(option: poketchOptions): void {
    this.option = this.options[option];
    this.titleLabel.setText(this.option.title);
  }

  clear() {
    if (!this.isSelect) {
      return;
    }
    if (this.tweensDelay.length) {
      this.tweensDelay.forEach((timer) => {
        timer.destroy();
      });
    }
    this.bg.setTint(undefined);
    if (!!this.overlay.alpha) {
      this.scene.tweens.add({
        targets: this.overlay,
        duration: 1000,
        alpha: 0,
        visible: false,
        ease: "Sine.easeOut",
      });
    }
    this.setX(this.originalX);
    this.setY(this.originalY);
    this.isSelect = false;
    this.tweensDelay.push(this.scene.time.delayedCall(5000, () => this.tweens.resume()));
    this.scene.tweens.add({
      targets: this.bg,
      width: this.width,
      height: this.height,
      duration: 700,
      ease: "Quad.easeIn"
    });
    this.scene.tweens.add({
      targets: this.poketch,
      x: 0,
      y: 0,
      duration: 700,
      ease: "Quad.easeIn"
    });
    this.scene.tweens.add({
      targets: this.screenContainer,
      x: this.width / 3,
      duration: 800,
      ease: "Quad.easeOut",
    });
    this.scene.tweens.add({
      targets: this.screenBox,
      width: this.width / 4,
      height: this.height / 2,
      duration: 800,
      ease: "Quad.easeOut",
    });
    this.screenBox.setFillStyle(0);
    this.titleLabel.setVisible(false);
    this.watch.setVisible(false);
    this.defaultButtons();
  }

  defaultButtons() {
    this.scene.tweens.add({
      targets: [ this.up, this.down ],
      width: 7,
      height: this.height / 4.5,
      x: this.width - 35,
      duration: 100
    });
    this.scene.tweens.add({
      targets: this.up,
      y: 10,
      duration: 100
    });
    this.scene.tweens.add({
      targets: this.down,
      y: this.height / 4 + 12,
      duration: 100
    });
  }

  public update() {
    if (this.isSelect) {
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();

      // Format 24 hrs HH:mm
      const clockString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

      this.watch.setText(clockString);
    }
  }
}
