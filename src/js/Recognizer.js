import { Point } from "./Point.js";
import { Gesture } from "./Gesture.js";

const numPoints = 64;
const squareSize = 250;
const angleRange = 45 * (Math.PI / 180); // in radians
const anglePrecision = 2 * (Math.PI / 180); // in radians
const phi = 0.5 * (-1 + Math.sqrt(5)); // Golden Ratio

const Recognizer = class {
  static computeAverageDistance(gesture, template) {
    let distanceSum = 0;

    for (let i = 0; i < gesture.points.length; i += 1) {
      distanceSum += Point.getDistance(gesture.points[i], template.points[i]);
    }

    return distanceSum / gesture.points.length;
  }

  static distanceAtBestAngle(gesture, template, a, b, threshold) {
    let x1 = phi * a + (1 - phi) * b;
    let x2 = (1 - phi) * a + phi * b;
    let gesture1 = gesture.rotateBy(x1);
    let gesture2 = gesture.rotateBy(x2);
    let f1 = Recognizer.computeAverageDistance(gesture1, template);
    let f2 = Recognizer.computeAverageDistance(gesture2, template);

    while (Math.abs(b - a) > threshold) {
      if (f1 < f2) {
        b = x2;
        x2 = x1;
        f2 = f1;
        x1 = phi * a + (1 - phi) * b;
        gesture1 = gesture.rotateBy(x1);
        f1 = Recognizer.computeAverageDistance(gesture1, template);
      } else {
        a = x1;
        x1 = x2;
        f1 = f2;
        x2 = (1 - phi) * a + phi * b;
        gesture2 = gesture.rotateBy(x2);
        f2 = Recognizer.computeAverageDistance(gesture2, template);
      }
    }

    return f1 < f2 ? { angle: x1, distance: f1 } : { angle: x2, distance: f2 };
  }

  constructor(templates) {
    this.templates = templates.map((template) => {
      return template
        .resample(numPoints)
        .scaleToSquare(squareSize)
        .translateToOrigin();
    });
  }

  recognize(gesture) {
    let bestScore = Number.POSITIVE_INFINITY;
    let bestTemplate = null;

    for (const template of this.templates) {
      // Golden Section Search
      const { angle, distance } = Recognizer.distanceAtBestAngle(
        gesture
          .resample(numPoints)
          .scaleToSquare(squareSize)
          .translateToOrigin(),
        template,
        -angleRange,
        angleRange,
        anglePrecision
      );

      const score = distance / numPoints;

      if (score < bestScore) {
        bestScore = score;
        bestTemplate = template;
      }
    }

    return { name: bestTemplate.name, score: bestScore };
  }

  addTemplate(gesture) {
    this.templates.push(
      gesture.resample(numPoints).scaleToSquare(squareSize).translateToOrigin()
    );
  }
};

export { Recognizer };
