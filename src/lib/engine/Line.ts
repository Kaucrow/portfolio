import type { Camera } from "./Camera.svelte";
import type { IDrawable } from "./IDrawable";
import type { Point } from "./IPoint"; // Import the Point interface
import { DrawingUtils } from "./DrawingUtils"; // Import the utility for drawing pixels

export class Line implements IDrawable {
  // x and y are required by IDrawable, but for a line, 'from' and 'to' are more descriptive.
  // We set x and y to the 'from' point for IDrawable compatibility
  public x: number;
  public y: number;
  public from: { x: number, y: number } = { x: 0, y: 0 };
  public to: { x: number, y: number } = { x: 0, y: 0 };

  constructor(public color: string = 'white', public width: number = 1) {
    this.x = 0;
    this.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, parentWorldX: number, parentWorldY: number) {
    ctx.imageSmoothingEnabled = false;

    if (this.width === 1) {
      this.drawBresenhamLine(ctx, camera, parentWorldX, parentWorldY);
    } else {
      const fromAbsoluteX = parentWorldX + this.from.x;
      const fromAbsoluteY = parentWorldY + this.from.y;

      const toAbsoluteX = parentWorldX + this.to.x;
      const toAbsoluteY = parentWorldY + this.to.y;

      // Convert absolute world positions to screen coordinates
      const fromScreenPos = camera.worldToScreen(fromAbsoluteX, fromAbsoluteY);
      const toScreenPos = camera.worldToScreen(toAbsoluteX, toAbsoluteY);

      ctx.beginPath();

      ctx.moveTo(Math.round(fromScreenPos.x), Math.round(fromScreenPos.y));
      ctx.lineTo(Math.round(toScreenPos.x), Math.round(toScreenPos.y));

      ctx.lineWidth = this.width;
      ctx.strokeStyle = this.color;
      ctx.stroke();

      ctx.closePath();
    }
  }
  
  private drawBresenhamLine (ctx: CanvasRenderingContext2D, camera: Camera, parentWorldX: number, parentWorldY: number) {
   // Calculate absolute world positions for 'from' and 'to' points
    const fromAbsoluteX = parentWorldX + this.from.x;
    const fromAbsoluteY = parentWorldY + this.from.y;

    const toAbsoluteX = parentWorldX + this.to.x;
    const toAbsoluteY = parentWorldY + this.to.y;

    // Convert absolute world positions to screen coordinates
    const fromScreenPos = camera.worldToScreen(fromAbsoluteX, fromAbsoluteY);
    const toScreenPos = camera.worldToScreen(toAbsoluteX, toAbsoluteY);

    // Set the line color
    ctx.fillStyle = this.color;

    // --- Bresenham's Line Algorithm ---
    let x0 = Math.round(fromScreenPos.x);
    let y0 = Math.round(fromScreenPos.y);
    let x1 = Math.round(toScreenPos.x);
    let y1 = Math.round(toScreenPos.y);

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
      DrawingUtils.drawPixel(ctx, x0, y0); // Draw the current pixel

      if (x0 === x1 && y0 === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  }
}