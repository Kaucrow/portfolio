// src/lib/RoomObject.ts
import type { Camera } from "./Camera";
import { Sprite } from "./Sprite";

export class RoomObject {
  x: number;
  y: number;
  sprite?: Sprite;

  constructor(x: number, y: number, sprite?: Sprite) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    const screenPos = camera.worldToScreen(this.x, this.y);

    if (!this.sprite || !this.sprite.isLoaded) return;

    const scaledWidth = this.sprite.width * this.sprite.scale;
    const scaledHeight = this.sprite.height * this.sprite.scale;

    const drawX = screenPos.x - scaledWidth / 2;
    const drawY = screenPos.y - scaledHeight / 2;

    ctx.drawImage(this.sprite.img, drawX, drawY, scaledWidth, scaledHeight);
  }
}