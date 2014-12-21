var ndbits = require('ndarray-bit');
var ops = require('ndarray-ops');
var lifeStep = require('./lifeStep');
var Rect = require('./geometry/Rect');
var Size = require('./geometry/Size');
var Point = require('./geometry/Point');


class Region {

  constructor(rect:Rect, points:Array) {
    this.rect = rect;
    this.points = points;
    this.still = false;
  }

  toString() {
    return `[Region ${this.rect} ${this.points}]`;
  }

  mutate() : Array {

    if (this.still) {
      return [this];
    }

    var current = ndbits([this.rect.size.width, this.rect.size.height]);
    var next = ndbits([this.rect.size.width, this.rect.size.height]);
    var expandLeft = false;
    var expandRight = false;
    var expandTop = false;
    var expandBottom = false;

    this.points.forEach(function(p) {
      current.set(p.x , p.y, true);
      next.set(p.x, p.y, true);
    });

    lifeStep(next, current);

    if (ops.equals(next, current)) {

      this.still = true;
      return [this];

    } else {

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
      var dx = expandLeft ? -1 : 0;
      var dy = expandTop ? -1 : 0;
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
      var rect = new Rect(origin, new Size(width, height));

      var points = [];
      for (x = 0; x < this.rect.size.width; x++) {
        for (y = 0; y < this.rect.size.height; y++) {
          if (next.get(x, y)) {
            points.push(new Point(x - dx, y - dy));
          }
        }
      }

      if (!points.length) {
        return [];
      }

      return [new Region(rect, points)];
    }
  }

}

module.exports = Region;
