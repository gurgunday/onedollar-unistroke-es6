import { Point } from "./Point.js";
import { Gesture } from "./Gesture.js";
import { Recognizer } from "./Recognizer.js";

const init = async function () {
  if (document.getElementById("mobile-warning")) {
    return;
  }

  const templatesJSON = await fetch("./src/templates.json").then((i) =>
    i.json()
  );
  const templates = templatesJSON.map(
    (t) =>
      new Gesture(
        t.name,
        t.points.map((p) => new Point(p.x, p.y))
      )
  );
  const recognizer = new Recognizer(templates);

  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  const points = [];
  context.lineWidth = 5;
  context.lineCap = "round";
  context.strokeStyle = "black";

  let currentX = 0;
  let currentY = 0;

  canvas.addEventListener("mousedown", (event) => {
    currentX = event.clientX - canvas.offsetLeft;
    currentY = event.clientY - canvas.offsetTop;
  });

  canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();
    currentX = event.touches[0].clientX - canvas.offsetLeft;
    currentY = event.touches[0].clientY - canvas.offsetTop;
  });

  canvas.addEventListener("mousemove", (event) => {
    if (event.buttons !== 1) {
      return;
    }

    context.beginPath();
    context.moveTo(currentX, currentY);

    currentX = event.clientX - canvas.offsetLeft;
    currentY = event.clientY - canvas.offsetTop;

    points.push(new Point(currentX, currentY));
    context.lineTo(currentX, currentY);

    context.stroke();
  });

  canvas.addEventListener("touchmove", (event) => {
    event.preventDefault();

    if (event.touches.length !== 1) {
      return;
    }

    context.beginPath();
    context.moveTo(currentX, currentY);

    currentX = event.touches[0].clientX - canvas.offsetLeft;
    currentY = event.touches[0].clientY - canvas.offsetTop;

    points.push(new Point(currentX, currentY));
    context.lineTo(currentX, currentY);

    context.stroke();
  });

  document.getElementById("recognizeBtn").addEventListener("click", () => {
    const result = recognizer.recognize(new Gesture("drawing", points));
    alert(`Recognized gesture: ${result.name} with score ${result.score}`);
  });

  document.getElementById("clearCanvasBtn").addEventListener("click", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    points.length = 0;
  });

  document.getElementById("addTemplateBtn").addEventListener("click", () => {
    const name = prompt("Enter a name for the new template:");

    if (!name) {
      return alert("Invalid name. Template not added.");
    }

    if (!points.length) {
      return alert("Invalid gesture. Template not added.");
    }

    recognizer.addTemplate(new Gesture(name, points));

    alert("Template added!");
  });

  document
    .getElementById("exportTemplatesBtn")
    .addEventListener("click", () => {
      const templatesJSON = JSON.stringify(recognizer.templates);
      const blob = new Blob([templatesJSON], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "templates.json";
      link.click();

      URL.revokeObjectURL(url);
    });
};

init();
