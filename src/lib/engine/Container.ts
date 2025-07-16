import type { Camera } from "./Camera";
import type { IDrawable } from "./IDrawable";

export class Container implements IDrawable {
  children: IDrawable[] = [];

  // x, y here are relative to this container's parent, or absolute if this is a root container
  constructor(public x: number = 0, public y: number = 0) {}

  add(child: IDrawable) {
    this.children.push(child);
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, parentWorldX: number, parentWorldY: number) {
    // Calculate this container's absolute world position
    const thisWorldX = parentWorldX + this.x;
    const thisWorldY = parentWorldY + this.y;

    // Recursively draw all children, passing down this container's absolute position
    for (const child of this.children) {
      child.draw(ctx, camera, thisWorldX, thisWorldY);
    }
  }

  updateGlobalScale(globalScale: number) {
    for (const child of this.children) {
      if (child.sprite) child.sprite.scale = globalScale;
    }
  }
}