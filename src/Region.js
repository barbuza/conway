var ndarray = require('ndarray');
var stepLife = require('./stepLife');
var Rect = require('./Rect');
var Size = require('./Size');

window.ndarray = ndarray;


class Region {

  constructor(rect:Rect, points:Array) {
    this._rect = rect;
    this._points = points;
  }

  get rect() : Rect {
    return this._rect;
  }

  get points() : Array {
    return this._points;
  }

  toString() {
    return `[Region ${this.rect} ${this.points}]`;
  }

  mutate() : Region {
    var current = ndarray(new Uint8Array(this.rect.size.width * this.rect.size.height), [this.rect.size.width, this.rect.size.height]);
    var next = ndarray(new Uint8Array(this.rect.size.width * this.rect.size.height), [this.rect.size.width, this.rect.size.height]);
    var expandLeft = false;
    var expandRight = false;
    var expandTop = false;
    var expandBottom = false;
    this.points.forEach(function(p) {
      current.set(p.x , p.y, 1);
      next.set(p.x, p.y, 1);
    });
    stepLife(next, current);
    //console.log(next);

    for (var x = 0; x < this.rect.size.width; x++) {
      if (next.get(x, 0)) {
        expandTop = true;
      }
      if (next.get(x, this.rect.size.height - 1)) {
        expandBottom = true;
      }
    }
    for (var y = 0; y < this.rect.size.height; y++) {
      if (next.get(0, y)) {
        expandLeft = true;
      }
      if (next.get(this.rect.size.width - 1, y)) {
        expandRight = true;
      }
    }
    var dx = 0;
    var dy = 0;
    if (expandLeft) {
      dx -= 1;
    }
    //if (expandRight) {
    //  dx += 1;
    //}
    if (expandTop) {
      dy -= 1;
    }
    //if (expandBottom) {
    //  dy += 1;
    //}
    var origin = this.rect.origin.translate(dx, dy);

    var width = this.rect.size.width;
    var height = this.rect.size.height;
    if (expandLeft) {
      width += 1;
    }
    if (expandRight) {
      width += 1;
    }
    if (expandTop) {
      height += 1;
    }
    if (expandBottom) {
      height += 1;
    }
    console.log({
      expandTop, expandBottom,
      expandLeft, expandRight
    }, dx, dy);
    var rect = new Rect(origin, new Size(width, height));
    //console.log(rect.toString());

    var points = [];
    for (x = 0; x < this.rect.size.width; x++) {
      for (y = 0; y < this.rect.size.height; y++) {
        if (next.get(x, y)) {
          points.push(new Point(x - dx, y - dy));
        }
      }
    }

    return new Region(rect, points);
  }

}

module.exports = Region;
