var Long = require('long');


class Point {

  constructor(x:Long, y:Long) {
    this.x = x;
    this.y = y;
  }

  translate(dx, dy) : Point {
    return new Point(this.x.add(dx), this.y.add(dy));
  }

  toString() {
    return `[Point ${this.x}x${this.y}]`;
  }

}


module.exports = Point;
