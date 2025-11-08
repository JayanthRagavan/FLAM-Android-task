🧠 Shape Detection Challenge

This project detects and classifies geometric shapes 🟢🔺⬜ from uploaded images using TypeScript and HTML5 Canvas.
It showcases real-time image analysis, contour detection, and confidence-based shape classification — all running in the browser! 🚀

✨ Features

✅ Upload any image (hand-drawn or digital)
✅ Detects and classifies multiple shapes at once
✅ Supports:
🔹 Circle
🔹 Triangle
🔹 Rectangle
🔹 Square
🔹 Pentagon
🔹 Polygon (for complex shapes)
✅ Displays results with confidence scores
✅ Sleek, modern UI with dynamic visualization

📁 Project Structure
shape-detector/
├── index.html           → Main web page  
├── src/
│   ├── main.ts          → Shape detection logic  
│   └── style.css        → UI styling  
├── package.json         → Project configuration  
└── README.txt           → Project documentation  

⚙️ Setup Instructions

🧩 Prerequisites

Node.js v16 or higher (✅ Recommended: v22.16.0 or newer)

npm or yarn package manager

💻 Steps to Run
1️⃣ Install dependencies → npm install
2️⃣ Start development server → npm run dev
3️⃣ Open your browser and visit 👉 http://localhost:5173 (port may vary)

🧾 How to Use

Click “Choose File” and upload an image containing simple shapes.

Supported formats: .jpg, .jpeg, .png

Recommended: black shapes on a white background for best accuracy.

The system automatically:
🔸 Detects edges and contours
🔸 Classifies the shape (triangle, circle, rectangle, etc.)
🔸 Calculates a dynamic confidence score

Results are displayed in real-time below the canvas 🎯

🧮 Example Output

Detected Shapes:
1️⃣ Shape: 🔺 Triangle | Confidence: 96%
2️⃣ Shape: 🟢 Circle | Confidence: 98%
3️⃣ Shape: ⬛ Rectangle | Confidence: 91%

🧠 Logic Overview

🔹 Converts image to grayscale
🔹 Applies Sobel edge detection
🔹 Extracts contours
🔹 Counts vertices to identify shape type
🔹 Calculates aspect ratios and angles
🔹 Classifies shapes dynamically

Confidence Score Formula 🧷
Calculated using:

Edge smoothness

Contour symmetry

Aspect ratio similarity

🎨 UI Highlights

🌈 Clean, responsive layout
🖼️ Centered canvas with shadow borders
⚡ Instant feedback after upload
📋 Results panel with highlighted detection summary

👨‍💻 Developer

Name: Jayanth Ragavan Mylsamy
Role: Developer & Designer
Platform: Visual Studio Code

📜 License

This project is open-source and free to use for learning, experimentation, and demonstration purposes.
