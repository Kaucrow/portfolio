export class Sprite {
  width: number = 0;
  height: number = 0;
  scale: number;
  isLoaded: boolean = false;
  private loadPromise: Promise<void>;
  img: HTMLImageElement;

  constructor(imgUrl: string, scale: number = 1) {
    this.scale = scale;

    this.img = new Image();
    this.img.src = imgUrl;

    this.loadPromise = new Promise((resolve, reject) => {
      this.img.onload = () => {
        this.width = this.img.width;
        this.height = this.img.height;
        this.isLoaded = true;
        resolve();
      }
      this.img.onerror = (e) => {
        console.error(`Failed to load sprite ${imgUrl}`);
        reject(e);
      };
    });
  }

  async awaitLoad(): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve(); // Already loaded, resolve immediately
    }
    return this.loadPromise; // Return the existing promise
  }
}