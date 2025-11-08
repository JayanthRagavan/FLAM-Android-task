export class ShapeDetector {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private imageData: ImageData;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
  }

  private toGrayscale(): Uint8ClampedArray {
    const gray = new Uint8ClampedArray(this.width * this.height);
    const data = this.imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      gray[i / 4] = avg;
    }
    return gray;
  }

  private sobelEdgeDetection(gray: Uint8ClampedArray): Uint8ClampedArray {
    const edge = new Uint8ClampedArray(this.width * this.height);
    const gxKernel = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const gyKernel = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        let gx = 0, gy = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const val = gray[(y + ky) * this.width + (x + kx)];
            gx += gxKernel[ky + 1][kx + 1] * val;
            gy += gyKernel[ky + 1][kx + 1] * val;
          }
        }
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edge[y * this.width + x] = magnitude > 128 ? 255 : 0;
      }
    }
    return edge;
  }

  detect(): string[] {
    const gray = this.toGrayscale();
    const edges = this.sobelEdgeDetection(gray);

    let shapes = [];
    let countEdges = edges.filter((v) => v === 255).length;
    if (countEdges > 50000) shapes.push('Circle');
    else if (countEdges > 20000) shapes.push('Rectangle');
    else if (countEdges > 10000) shapes.push('Triangle');
    else shapes.push('Unknown');

    return shapes;
  }
}
