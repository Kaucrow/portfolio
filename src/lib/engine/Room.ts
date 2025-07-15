import type { Camera } from "./Camera";
import { RoomObject } from "./RoomObject";

export class Room {
  width: number;
  height: number;
  objects: RoomObject[];

  constructor(width: number, height: number, objects: RoomObject[]) {
    this.width = width;
    this.height = height;
    this.objects = objects;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    this.objects.forEach(obj => {
      obj.draw(ctx, camera); 
    })
  }
}