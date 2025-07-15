export class Sprite {
  width: number = 0;
  height: number = 0;
  scale: number;
  isLoaded: boolean = false;
  img: HTMLImageElement;

  constructor(imgUrl: string, scale: number = 0) {
    this.scale = scale;

    this.img = new Image();
    this.img.src = imgUrl;
    this.img.onerror = () => {
      console.error(`Failed to load sprite ${imgUrl}`);
    }
    this.img.onload = () => {
      this.width = this.img.width;
      this.height = this.img.height;
      this.isLoaded = true;
    }
  }
}