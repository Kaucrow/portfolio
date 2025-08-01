import type { Camera } from "./Camera.svelte";
import { Container } from "./Container";
import { type Dir, Transition } from "./Transition";

export class Room {
  private rootContainer: Container;
  private transition: Transition;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private camera: Camera,
    public width: number,
    public height: number
  ) {
    // Initialize a root container. Its (0,0) is effectively the world origin.
    this.rootContainer = new Container(0, 0);

    this.transition = new Transition(ctx, camera);
  }

  // Method to get the root container, so one can add objects to it from outside
  getRootContainer(): Container {
    return this.rootContainer;
  }

  clearTransition() {
    this.transition.clear();
  }

  configureTransition(dir: Dir, onComplete?: Function, scrollSpeed?: number) {
    this.transition.configure(dir, onComplete, scrollSpeed);
  }

  beginTransition() {
    this.transition.begin();
  }

  clearObjects() {
    this.rootContainer.children = [];
  }

  update(deltaTime: number) {
    this.transition.update(deltaTime);
  }

  draw() {
    // The root container's "parent" is the world origin, so parentWorldX/Y are 0
    this.rootContainer.draw(this.ctx, this.camera, 0, 0);
    this.transition.draw();
  }
}