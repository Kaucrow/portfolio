import type { Camera } from "./Camera";
import { Container } from "./Container";

export class Room {
  private rootContainer: Container;

  constructor(public width: number, public height: number) {
    // Initialize a root container. Its (0,0) is effectively the world origin.
    this.rootContainer = new Container(0, 0);
  }

  // Method to get the root container, so one can add objects to it from outside
  getRootContainer(): Container {
    return this.rootContainer;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    // The root container's "parent" is the world origin, so parentWorldX/Y are 0
    this.rootContainer.draw(ctx, camera, 0, 0);
  }
}