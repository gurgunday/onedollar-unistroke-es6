import { Point } from "./Point.js";

const Gesture = class {
  constructor(name, points) {
    this.name = name;
    this.points = points;
  }

  rotateBy(angle) {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const centroidX =
      this.points.reduce((sum, point) => sum + point.x, 0) / this.points.length;
    const centroidY =
      this.points.reduce((sum, point) => sum + point.y, 0) / this.points.length;

    const rotatedPoints = this.points.map((point) => {
      const deltaX = point.x - centroidX;
      const deltaY = point.y - centroidY;

      const newX = deltaX * cosA - deltaY * sinA + centroidX;
      const newY = deltaX * sinA + deltaY * cosA + centroidY;
      return new Point(newX, newY);
    });

    return new Gesture(this.name, rotatedPoints);
  }

  resample(numPoints) {
    const increment = Point.getPathLength(this.points) / (numPoints - 1);
    const resampledPoints = [this.points[0]];
    let distanceSoFar = 0;

    for (let i = 1; i < this.points.length; i += 1) {
      const distance = Point.getDistance(this.points[i - 1], this.points[i]);

      if (distanceSoFar + distance >= increment) {
        const remainingDistance = increment - distanceSoFar;
        const ratio = remainingDistance / distance;
        const newX =
          this.points[i - 1].x +
          ratio * (this.points[i].x - this.points[i - 1].x);
        const newY =
          this.points[i - 1].y +
          ratio * (this.points[i].y - this.points[i - 1].y);
        const newPoint = new Point(newX, newY);

        resampledPoints.push(newPoint);
        this.points.splice(i, 0, newPoint);
        distanceSoFar = 0;
      } else {
        distanceSoFar += distance;
      }
    }

    if (resampledPoints.length === numPoints - 1) {
      resampledPoints.push(this.points[this.points.length - 1]);
    }

    return new Gesture(this.name, resampledPoints);
  }

  scaleToSquare(size) {
    const minX = Math.min(...this.points.map((p) => p.x));
    const maxX = Math.max(...this.points.map((p) => p.x));
    const minY = Math.min(...this.points.map((p) => p.y));
    const maxY = Math.max(...this.points.map((p) => p.y));

    const width = maxX - minX;
    const height = maxY - minY;

    const scaledPoints = this.points.map((point) => {
      const scaledX = point.x * (size / width);
      const scaledY = point.y * (size / height);
      return new Point(scaledX, scaledY);
    });

    return new Gesture(this.name, scaledPoints);
  }

  translateToOrigin() {
    const centroidX =
      this.points.reduce((sum, point) => sum + point.x, 0) / this.points.length;
    const centroidY =
      this.points.reduce((sum, point) => sum + point.y, 0) / this.points.length;

    const translatedPoints = this.points.map((point) => {
      const translatedX = point.x - centroidX;
      const translatedY = point.y - centroidY;
      return new Point(translatedX, translatedY);
    });

    return new Gesture(this.name, translatedPoints);
  }
};

export { Gesture };
