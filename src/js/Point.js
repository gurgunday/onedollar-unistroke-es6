const Point = class {
  static getDistance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  }

  static getPathLength(points) {
    let length = 0;

    for (let i = 1; i < points.length; i += 1) {
      length += Point.getDistance(points[i - 1], points[i]);
    }

    return length;
  }

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
};

export { Point };
