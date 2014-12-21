var BigNum = require('big-number').n;
var Long = require('long');

var Point = require('./Point');
var Size = require('./Size');


function intersects(r1, r2) {
  return !(
    r2.left.gt(r1.left)
    || r2.right.lt(r1.left)
    || r2.top.gt(r1.bottom)
    || r2.bottom.lt(r1.top)
  );
}


class Rect {

  constructor(origin:Point, size:Size) {
    this._origin = origin;
    this._size = size;
  }

  get edge() : Point {
    return new Point(this.right, this.bottom);
  }

  get origin() : Point {
    return this._origin;
  }

  get size() : Size {
    return this._size;
  }

  get left() : BigNum {
    return this.origin.x;
  }

  get right() : BigNum {
    return BigNum(this.left.val()).add(this.width);
  }

  get top() : BigNum {
    return this.origin.y;
  }

  get bottom() : BigNum {
    return BigNum(this.top.val()).add(this.height);
  }

  get width() : Number {
    return this.size.width;
  }

  get height() : Number {
    return this.size.height;
  }

  intersects(other) {
    return intersects(this, other) || intersects(other, this);
  }

  toString() {
    return `[Rect ${this.left}x${this.top} ${this.width}:${this.height}]`;
  }

  static make(x, y, w, h) {
    return new Rect(new Point(BigNum(x), BigNum(y)), new Size(w, h));
  }

}

module.exports = Rect;
