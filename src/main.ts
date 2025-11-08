// src/main.ts
interface DetectedShape {
  type: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  center: { x: number; y: number };
  area: number;
}

interface DetectionResult {
  shapes: DetectedShape[];
}

export class ShapeDetector {
  async detectShapes(imageData: ImageData): Promise<DetectionResult> {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // Convert to grayscale
    const gray = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      gray[i / 4] = avg;
    }

    // Edge detection
    const edges = this.sobelEdge(gray, width, height);
    const contours = this.findContours(edges, width, height);

    const detectedShapes: DetectedShape[] = [];
    for (const contour of contours) {
      const shape = this.classifyShape(contour);
      if (shape) detectedShapes.push(shape);
    }

    return { shapes: detectedShapes };
  }

  private sobelEdge(gray: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    const edges = new Uint8ClampedArray(width * height);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sumX = 0, sumY = 0, index = 0;
        for (let j = -1; j <= 1; j++) {
          for (let i = -1; i <= 1; i++) {
            const pixel = gray[(y + j) * width + (x + i)];
            sumX += pixel * gx[index];
            sumY += pixel * gy[index];
            index++;
          }
        }
        const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
        edges[y * width + x] = magnitude > 100 ? 255 : 0;
      }
    }
    return edges;
  }

  private findContours(edges: Uint8ClampedArray, width: number, height: number): number[][] {
    const visited = new Uint8Array(width * height);
    const contours: number[][] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const inBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (edges[y * width + x] === 255 && !visited[y * width + x]) {
          const stack = [[x, y]];
          const contour: number[] = [];

          while (stack.length > 0) {
            const [cx, cy] = stack.pop()!;
            if (!inBounds(cx, cy) || visited[cy * width + cx] || edges[cy * width + cx] === 0) continue;
            visited[cy * width + cx] = 1;
            contour.push(cx, cy);
            for (const [dx, dy] of directions) stack.push([cx + dx, cy + dy]);
          }
          if (contour.length > 40) contours.push(contour);
        }
      }
    }
    return contours;
  }

  // Helper: approximate polygon vertices from contour
  private approximatePolygon(points: number[]): { x: number; y: number }[] {
    const threshold = 8;
    const vertices: { x: number; y: number }[] = [];
    for (let i = 0; i < points.length; i += 2) {
      if (
        i === 0 ||
        Math.hypot(points[i] - points[i - 2], points[i + 1] - points[i - 1]) > threshold
      ) {
        vertices.push({ x: points[i], y: points[i + 1] });
      }
    }
    return vertices;
  }

  private classifyShape(contour: number[]): DetectedShape | null {
    if (!contour || contour.length < 6) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < contour.length; i += 2) {
      const x = contour[i], y = contour[i + 1];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const ratio = width / height;
    const area = width * height;
    const center = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };

    // 🧠 Polygon approximation
    const vertices = this.approximatePolygon(contour);
    const vCount = vertices.length;

    // 🔹 Shape classification using vertex count
    let type = "unknown";
    if (vCount === 3) {
      type = "triangle";
    } else if (vCount === 4) {
      if (Math.abs(ratio - 1) < 0.2) type = "square";
      else type = "rectangle";
    } else if (vCount === 5) {
      type = "pentagon";
    } else if (vCount > 5) {
      type = "circle";
    }

    // 🔹 Dynamic confidence scoring
    let confidence = 0.7;
    if (type === "circle") {
      const circularity = Math.min(width, height) / Math.max(width, height);
      confidence = 0.6 + 0.4 * circularity;
    } else if (type === "square" || type === "rectangle") {
      const rectness = 1 - Math.abs(1 - ratio);
      confidence = 0.6 + 0.4 * rectness;
    } else if (type === "triangle" || type === "pentagon") {
      confidence = 0.8;
    }

    return {
      type,
      confidence: Math.min(confidence, 1.0),
      boundingBox: { x: minX, y: minY, width, height },
      center,
      area,
    };
  }
}

// Front-end rendering logic
window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("imageUpload") as HTMLInputElement;
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const output = document.getElementById("output") as HTMLDivElement;

  const detector = new ShapeDetector();

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const result = await detector.detectShapes(imageData);

      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      for (const shape of result.shapes) {
        const { x, y, width, height } = shape.boundingBox;
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = "red";
        ctx.fillText(`${shape.type} (${shape.confidence.toFixed(2)})`, x, y - 5);
      }

      output.innerText = JSON.stringify(result.shapes, null, 2);
    };
  });
});
// 🎨 Enhanced Front-end rendering logic
window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("imageUpload") as HTMLInputElement;
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const output = document.getElementById("output") as HTMLPreElement;
  const summary = document.getElementById("summary")!;
  const clearBtn = document.getElementById("clearBtn")!;
  const sampleBtn = document.getElementById("sampleBtn")!;
  const uploadArea = document.getElementById("upload-area")!;
  const detector = new ShapeDetector();

  // Handle file upload
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const result = await detector.detectShapes(imageData);

      // Draw bounding boxes & labels
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      for (const shape of result.shapes) {
        const { x, y, width, height } = shape.boundingBox;
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = "red";
        ctx.font = "14px Poppins";
        ctx.fillText(`${shape.type} (${(shape.confidence * 100).toFixed(1)}%)`, x, y - 5);
      }

      // 🧾 Show summary info
      const totalShapes = result.shapes.length;
      const counts: Record<string, number> = {};
      result.shapes.forEach((s) => {
        counts[s.type] = (counts[s.type] || 0) + 1;
      });

      let summaryHtml = `<strong>Total Shapes:</strong> ${totalShapes}<br>`;
      for (const [type, count] of Object.entries(counts)) {
        summaryHtml += `<span style="color:#007BFF">${type}</span>: ${count} &nbsp; `;
      }
      summary.innerHTML = summaryHtml;

      // Detailed JSON output
      output.innerText = JSON.stringify(result.shapes, null, 2);
    };
  });

  // 🎨 Drag-and-drop upload support
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("hover");
  });
  uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("hover"));
  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("hover");
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      (document.getElementById("imageUpload") as HTMLInputElement).files = e.dataTransfer.files;
      input.dispatchEvent(new Event("change"));
    }
  });

  // 🧹 Clear button
  clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    output.innerText = "";
    summary.innerHTML = "";
  });

  // 📂 Load sample image
  sampleBtn.addEventListener("click", () => {
    const img = new Image();
    img.src = "test-images/sample1.png"; // Change path if needed
    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const result = await detector.detectShapes(imageData);

      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      for (const shape of result.shapes) {
        const { x, y, width, height } = shape.boundingBox;
        ctx.strokeRect(x, y, width, height);
        ctx.fillText(shape.type, x, y - 5);
      }
      output.innerText = JSON.stringify(result.shapes, null, 2);
    };
  });
});
