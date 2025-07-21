export class Sprite {
  width: number = 0;
  height: number = 0;
  scale: number;
  isLoaded: boolean = false;
  onLoad: Function;
  private loadPromise: Promise<void>;
  img: HTMLImageElement;

  constructor(
    imgUrl: string,
    scale: number = 1,
    onLoad: Function = () => {}
  ) {
    this.scale = scale;

    this.img = new Image();
    this.img.src = imgUrl;

    this.onLoad = onLoad;

    this.loadPromise = new Promise((resolve, reject) => {
      this.img.onload = () => {
        this.width = this.img.width;
        this.height = this.img.height;
        this.isLoaded = true;
        this.onLoad();
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