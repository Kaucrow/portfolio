type Dir = 'intoLeft' | 'fromLeft' | 'intoRight' | 'fromRight';

import { Sprite } from './Sprite';
import type { Camera } from './Camera';

import ditherHeavyImg from '$lib/assets/dither_heavy.png';
import ditherLightImg from '$lib/assets/dither_light.png';

export class Transition {
  ditherHeavySpr: Sprite;
  ditherLightSpr: Sprite;
  dir: Dir;
  scrollSpeed: number;
  scrollX: number = 0;
  onComplete: Function;
  paused: boolean = true;
  private ditherPattern: CanvasPattern | null = null; // Property to store the created combined pattern
  private combinedPatternWidth: number = 0; // Stores the total width of the combined dither pattern
  private loadedSpritesCount: number = 0; // To track when both sprites are loaded

  constructor(
    dir: Dir,
    globalScale: number,
    private camera: Camera, // Store camera for use in init and pattern creation
    onComplete: Function = () => {},
    scrollSpeed: number = 30,
  ) {
    this.dir = dir;
    this.scrollSpeed = scrollSpeed;
    this.onComplete = onComplete;

    this.ditherHeavySpr = new Sprite(ditherHeavyImg, globalScale, () => {
      this.loadedSpritesCount++;
      this.checkAllSpritesLoaded();
    });

    this.ditherLightSpr = new Sprite(ditherLightImg, globalScale, () => {
      this.loadedSpritesCount++;
      this.checkAllSpritesLoaded();
    });
  }

  // Checks if both dither sprites have finished loading
  private checkAllSpritesLoaded() {
    if (this.loadedSpritesCount === 2) {
      this.combinedPatternWidth = (this.ditherHeavySpr.img.width * this.ditherHeavySpr.scale) +
                                  (this.ditherLightSpr.img.width * this.ditherLightSpr.scale);

      // Initialize scroll position based on direction and combined width
      switch (this.dir) {
        case 'intoRight':
        case 'fromLeft':
          this.scrollX = -this.combinedPatternWidth; // Starts off-screen left
          break;
        case 'intoLeft':
        case 'fromRight':
          this.scrollX = this.camera.viewportWidth; // Starts covering from the right edge of the viewport
          break;
      }
      this.paused = false; // Transition is ready to begin
    }
  }

  updateGlobalScale(globalScale: number) {
    // Ensure sprites are loaded before attempting to update their scale
    if (!this.ditherHeavySpr.isLoaded || !this.ditherLightSpr.isLoaded) {
      console.warn("Sprites not loaded yet, cannot update global scale.");
      return;
    }

    // Apply the new scale to both dither sprites
    this.ditherHeavySpr.scale = globalScale;
    this.ditherLightSpr.scale = globalScale;

    // Recalculate combined pattern width based on new scaled sprite widths
    this.combinedPatternWidth = (this.ditherHeavySpr.img.width * this.ditherHeavySpr.scale) +
                                (this.ditherLightSpr.img.width * this.ditherLightSpr.scale);

    // Invalidate the existing dither pattern so it's recreated with the new scale
    this.ditherPattern = null;

    // Re-adjust scrollX to account for the new combined pattern width,
    // especially if the transition is ongoing or about to start.
    // This prevents jumps if the scale changes mid-transition.
    switch (this.dir) {
      case 'intoRight':
        this.scrollX = -this.combinedPatternWidth;
        break;
      case 'fromRight':
        this.scrollX = 0;
        break;
      case 'intoLeft':
        this.scrollX = this.camera.viewportWidth;
        break;
      case 'fromLeft':
        this.scrollX = this.camera.viewportWidth - this.combinedPatternWidth;
        break;
    }
  }

  update(camera: Camera) {
    // Ensure both sprites are loaded before updating
    if (this.paused || !this.ditherHeavySpr.isLoaded || !this.ditherLightSpr.isLoaded) return;

    const adjustedScrollSpeed = Math.round(this.scrollSpeed * (camera.viewportWidth / 1280));

    switch (this.dir) {
      case 'intoRight':
      case 'fromLeft':
        this.scrollX += adjustedScrollSpeed;
        // The condition to complete should be when the leading edge of the combined pattern
        // has fully crossed the viewport.
        if (this.scrollX >= camera.viewportWidth) {
          this.onComplete();
          this.paused = true;
        }
        // Ensure scrollX is an odd number to prevent sub-pixel issues if it lands on an even number
        if (this.scrollX % 2 === 0) {
          this.scrollX += 1;
        }
        break;
      case 'intoLeft':
      case 'fromRight':
        this.scrollX -= adjustedScrollSpeed;
        // The condition to complete is when the pattern has fully scrolled off-screen left.
        if (this.scrollX + this.combinedPatternWidth <= 0) {
          this.onComplete();
          this.paused = true;
        }
        // Ensure scrollX is an odd number to prevent sub-pixel issues if it lands on an even number
        if (this.scrollX % 2 === 0) {
          this.scrollX -= 1;
        }
        break;
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    // Return early if not ready to draw (paused or images not loaded)
    if (!this.ditherHeavySpr.isLoaded || !this.ditherLightSpr.isLoaded) return;

    // Create the combined pattern once both dither images are loaded and `ctx` is available.
    // This part is now conditional based on the direction and if the pattern needs recreation.
    if (this.ditherPattern === null) {
      // Create a temporary canvas to draw the combined dither pattern
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');

      if (!tempCtx) {
        console.warn("Could not get 2D context for temporary canvas.");
        return;
      }

      // Calculate scaled dimensions for drawing onto the temporary canvas
      const heavyScaledWidth = this.ditherHeavySpr.img.width * this.ditherHeavySpr.scale;
      const heavyScaledHeight = this.ditherHeavySpr.img.height * this.ditherHeavySpr.scale;
      const lightScaledWidth = this.ditherLightSpr.img.width * this.ditherLightSpr.scale;
      const lightScaledHeight = this.ditherLightSpr.img.height * this.ditherLightSpr.scale;

      // Set the temporary canvas dimensions to hold both images side-by-side
      tempCanvas.width = heavyScaledWidth + lightScaledWidth;
      tempCanvas.height = Math.max(heavyScaledHeight, lightScaledHeight); // Use max scaled height

      // Draw dithers based on the direction, using calculated scaled dimensions
      // Pattern logic:
      // intoRight, fromLeft: [Heavy | Light]
      // intoLeft, fromLeft: [Light | Heavy]
      if (this.dir === 'intoRight' || this.dir === 'fromRight') {
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(this.ditherHeavySpr.img, 0, 0, heavyScaledWidth, heavyScaledHeight);
        tempCtx.imageSmoothingEnabled = false; // Re-set for safety, though generally not needed
        tempCtx.drawImage(this.ditherLightSpr.img, heavyScaledWidth, 0, lightScaledWidth, lightScaledHeight);
      } else { // fromRight or intoLeft
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(this.ditherLightSpr.img, 0, 0, lightScaledWidth, lightScaledHeight);
        tempCtx.imageSmoothingEnabled = false; // Re-set for safety
        tempCtx.drawImage(this.ditherHeavySpr.img, lightScaledWidth, 0, heavyScaledWidth, heavyScaledHeight);
      }

      // Create the pattern from the temporary canvas
      this.ditherPattern = ctx.createPattern(tempCanvas, 'repeat');
      if (!this.ditherPattern) {
        console.warn("Could not create combined dither pattern.");
        return; // Cannot draw without a pattern
      }
    }

    // Use integer values to prevent sub-pixel gaps
    const scrollXInt = Math.round(this.scrollX);
    const combinedWidthInt = Math.round(this.combinedPatternWidth);

    // First fill the appropriate area with black
    ctx.fillStyle = 'black';
    switch (this.dir) {
      case 'intoRight':
      case 'fromRight':
        ctx.fillRect(0, 0, scrollXInt, camera.viewportHeight);
        break;
      case 'intoLeft':
      case 'fromLeft':
        ctx.fillRect(scrollXInt + combinedWidthInt, 0,
                     camera.viewportWidth - (scrollXInt + combinedWidthInt),
                     camera.viewportHeight);
        break;
    }

    // Draw the dither pattern
    ctx.save();
    ctx.translate(scrollXInt, 0); // Translate the canvas context by the current scroll position

    // Fill exactly the area we want the pattern to appear in
    ctx.fillStyle = this.ditherPattern;
    ctx.fillRect(0, 0, combinedWidthInt, camera.viewportHeight);

    ctx.restore(); // Restore the canvas context
  }
}