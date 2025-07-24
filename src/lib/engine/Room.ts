import type { Camera } from "./Camera.svelte";
import { Container } from "./Container";
import type { Transition } from "./Transition";

export class Room {
  private rootContainer: Container;
  private activeTransition: Transition | null;

  constructor(public width: number, public height: number) {
    // Initialize a root container. Its (0,0) is effectively the world origin.
    this.rootContainer = new Container(0, 0);
    this.activeTransition = null;
  }

  // Method to get the root container, so one can add objects to it from outside
  getRootContainer(): Container {
    return this.rootContainer;
  }

  beginTransition(transition: Transition) {
    if (this.activeTransition) return;

    this.activeTransition = transition;
  }

  clearTransition() {
    this.activeTransition = null;
  }

  clearObjects() {
    this.rootContainer.children = [];
  }

  update(camera: Camera, deltaTime: number) {
    this.activeTransition?.update(camera, deltaTime);
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    // The root container's "parent" is the world origin, so parentWorldX/Y are 0
    this.rootContainer.draw(ctx, camera, 0, 0);
    this.activeTransition?.draw(ctx, camera);
  }
}