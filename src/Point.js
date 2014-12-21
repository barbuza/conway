var BigNum = require('big-number').n;


class Point {

  constructor(x:BigNum, y:BigNum) {
    this._x = x;
    this._y = y;
  }

  translate(dx, dy) {
    return new Point(this.x.add(dx), this.y.add(dy));
  }

  get x() : BigNum {
    if (typeof this._x === 'number') {
      return this._x;
    }
    return BigNum(this._x.val());
  }

  get y() : BigNum {
    if (typeof this._y === 'number') {
      return this._y;
    }
    return BigNum(this._y.val());
  }

  toString() {
    return `[Point ${this.x}x${this.y}]`;
  }

}

module.exports = Point;
