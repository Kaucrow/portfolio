import type { Camera } from "./Camera";
import { Sprite } from "./Sprite";
import type { IDrawable } from "./IDrawable";

export class RoomObject implements IDrawable {
  sprite?: Sprite;

  constructor(public x: number, public y: number, sprite?: Sprite) {
    this.sprite = sprite;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, parentWorldX: number, parentWorldY: number) {
    if (!this.sprite || !this.sprite.isLoaded) return;

    // Calculate this object's absolute world position
    // This is its position relative to the container, plus the container's absolute position
    const absoluteX = parentWorldX + this.x * this.sprite.scale;
    const absoluteY = parentWorldY + this.y * this.sprite.scale;

    // Use the object's absolute world position for camera transformation
    const screenPos = camera.worldToScreen(absoluteX, absoluteY);

    const scaledWidth = this.sprite.width * this.sprite.scale;
    const scaledHeight = this.sprite.height * this.sprite.scale;

    // Ensure the center of the scaled sprite aligns with screenPos.x and screenPos.y
    const drawX = screenPos.x - scaledWidth / 2;
    const drawY = screenPos.y - scaledHeight / 2;

    ctx.drawImage(this.sprite.img, drawX, drawY, scaledWidth, scaledHeight);
  }
}