export class DrawingUtils {
    static drawPixel(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }
}