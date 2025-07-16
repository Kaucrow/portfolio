import type { Camera } from "./Camera";
import type { Sprite } from "./Sprite";

export interface IDrawable {
  sprite?: Sprite;

  draw(ctx: CanvasRenderingContext2D, camera: Camera, parentWorldX: number, parentWorldY: number): void;
}