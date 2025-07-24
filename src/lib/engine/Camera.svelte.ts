export class Camera {
  x: number = 0;
  y: number = 0;
  zoom: number = 1;
  globalScale: number = $state(1);

  constructor(public viewportWidth: number, public viewportHeight: number) {}

  // Convert world coordinates to screen space
  worldToScreen(x: number, y: number): { x: number; y: number } {
    // Translate world point relative to camera's current position
    const translatedX = x - this.x;
    const translatedY = y - this.y;

    // Apply camera's internal zoom
    const zoomedX = translatedX * this.zoom;
    const zoomedY = translatedY * this.zoom;

    // Apply the global scale to the zoomed coordinates
    const scaledX = zoomedX * this.globalScale;
    const scaledY = zoomedY * this.globalScale;

    // Add half the viewport dimensions to center the camera view on the screen
    return {
      x: Math.floor(scaledX + this.viewportWidth / 2),
      y: Math.floor(scaledY + this.viewportHeight / 2),
    };
  }

  scale(val: number): number {
    return Math.floor(val * this.globalScale);
  }

  normalize(val: number): number {
    return Math.floor(val / this.globalScale);
  }

  setViewport(width: number, height: number) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  // Pan or zoom
  move(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }
}