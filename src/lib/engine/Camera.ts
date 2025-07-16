export class Camera {
  x: number = 0;
  y: number = 0;
  zoom: number = 1;

  constructor(public viewportWidth: number, public viewportHeight: number) {}

  // Convert world coordinates to screen space
  worldToScreen(x: number, y: number): { x: number; y: number } {
    return {
      x: Math.round((x - this.x) * this.zoom + this.viewportWidth / 2),
      y: Math.round((y - this.y) * this.zoom + this.viewportHeight / 2),
    };
  }

  // Pan or zoom
  move(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }
}