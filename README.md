Shape Detection Challenge

This project detects and classifies geometric shapes (like circles, rectangles, triangles, pentagons, etc.) from uploaded images using TypeScript and HTML5 Canvas.

Features

Upload any shape image (hand-drawn or digital).

Automatically detects shapes and outlines them.

Displays classification results (shape type and confidence score).

Supports detection of:
• Circle
• Square
• Rectangle
• Triangle
• Pentagon
• Polygon (for complex shapes)

Clean and interactive UI with real-time results.

Project Structure

shape-detector/
├── index.html → Main web page
├── src/
│ ├── main.ts → Shape detection logic
│ └── style.css → UI styling
├── package.json → Project configuration
└── README.txt → Project documentation

Setup Instructions

Prerequisites:

Node.js version 16 or higher (Recommended: v22.16.0 or later)

npm or yarn package manager

Steps to Run:

Install dependencies → npm install

Start the development server → npm run dev

Open your browser and go to http://localhost:5173
 (port may vary)

How to Use

Click on “Choose File” and upload an image that contains simple geometric shapes.

Supported formats: .jpg, .png, .jpeg

Recommended: Black shapes on white background for best accuracy.

Once uploaded, the app automatically:

Detects contours

Identifies shape type

Calculates confidence score

Results are displayed below the canvas.

Example Output

Detected Shapes:

Shape: Triangle | Confidence: 96%

Shape: Circle | Confidence: 98%

Shape: Rectangle | Confidence: 91%

Logic Overview

Converts the image to grayscale.

Applies edge detection (Sobel or Canny filters).

Extracts contours and counts vertices.

Classifies shapes based on vertex count and geometric proportions.

Calculates a confidence score based on:
• Edge smoothness
• Symmetry
• Aspect ratio similarity

UI Highlights

Minimalist and clean interface.

Centered interactive canvas with shadowed borders.

Auto-updating results panel that lists all detected shapes.

User-friendly layout for easy testing.

Developer

JayanthRagavan M

License

This project is open-source and can be used freely for learning and experimentation.
