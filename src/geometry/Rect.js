var Long = require('long');

var Point = require('./Point');
var Size = require('./Size');


function _intersects(r1:Rect, r2:Rect) : Boolean {
  return !(
  r2.left.greaterThan(r1.left)
  || r2.right.lessThan(r1.left)
  || r2.top.greaterThan(r1.bottom)
  || r2.bottom.lessThan(r1.top)
  );
}


class Rect {

  constructor(origin:Point, size:Size) {
    this.origin = origin;
    this.size = size;
    this.left = origin.x;
    this.top = origin.y;
    this.right = origin.x.add(size.width);
    this.bottom = origin.y.add(size.height);
    this.width = size.width;
    this.height = size.height;
    this.edge = new Point(this.right, this.bottom);
  }

  intersects(other) {
    return _intersects(this, other) || _intersects(other, this);
  }

  toString() {
    return `[Rect ${this.left}x${this.top} ${this.width}:${this.height}]`;
  }

  static make(x, y, w, h) {
    return new Rect(new Point(Long.fromInt(x), Long.fromInt(y)), new Size(w, h));
  }

}


module.exports = Rect;
