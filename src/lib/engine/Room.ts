import type { Camera } from "./Camera";
import { Container } from "./Container";
import type { Transition } from "./Transition";

export class Room {
  private rootContainer: Container;
  private transitions: Transition[];

  constructor(public width: number, public height: number) {
    // Initialize a root container. Its (0,0) is effectively the world origin.
    this.rootContainer = new Container(0, 0);
    this.transitions = [];
  }

  // Method to get the root container, so one can add objects to it from outside
  getRootContainer(): Container {
    return this.rootContainer;
  }

  beginTransition(transition: Transition) {
    this.transitions.push(transition);
  }

  updateGlobalScale(globalScale: number) {
    this.rootContainer.updateGlobalScale(globalScale);

    this.transitions.forEach(transition => {
      transition.updateGlobalScale(globalScale)
    });
  }

  update(camera: Camera) {
    this.transitions.forEach(transition => transition.update(camera));
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    // The root container's "parent" is the world origin, so parentWorldX/Y are 0
    this.rootContainer.draw(ctx, camera, 0, 0);
    this.transitions.forEach(transition => transition.draw(ctx, camera));
  }
}