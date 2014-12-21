var Long = require('long');


class Point {

  constructor(x:Long, y:Long) {
    this.x = x;
    this.y = y;
  }

  translate(dx:Number, dy:Number) : Point {
    if (!dx && !dy) {
      return this;
    }
    return new Point(this.x.add(dx), this.y.add(dy));
  }

  toString() : String {
    return `[Point ${this.x}x${this.y}]`;
  }

}


module.exports = Point;
