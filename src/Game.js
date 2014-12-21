var BigNum = require('big-number').n;

var Point = require('./Point');
var Size = require('./Size');
var Rect = require('./Rect');
var Region = require('./Region');


function mergeRegions(regions:Array) {
  regions = regions.slice(0);
  for (var ri = 0; ri < regions.length; ri++) {
    for (var rs = ri + 1; rs < regions.length; rs++) {
      if (regions[ri].rect.intersects(regions[rs].rect)) {
        var r1 = regions[ri];
        var r2 = regions[rs];
        regions.splice(regions.indexOf(r1), 1);
        regions.splice(regions.indexOf(r2), 1);
        regions.unshift(_mergeRegions(r1, r2));
        return mergeRegions(regions);
      }
    }
  }
  return regions.slice(0);
}


function _mergeRegions(r1:Region, r2:Region) {
  var o1 = r1.rect.origin;
  var o2 = r2.rect.origin;
  var x = o1.x.lt(o2.x) ? o1.x : o2.x;
  var y = o1.y.lt(o2.y) ? o1.y : o2.y;
  var origin = new Point(x, y);

  var e1 = r1.rect.edge;
  var e2 = r2.rect.edge;
  x = e1.x.gt(e2.x) ? e1.x : e2.x;
  y = e1.y.gt(e2.y) ? e1.y : e2.y;
  var edge = new Point(x, y);

  var width = parseInt(edge.x.subtract(origin.x).val(), 10);
  var height = parseInt(edge.y.subtract(origin.y).val(), 10);

  var rect = new Rect(origin, new Size(width, height));

  var points = [];

  var dx = parseInt(origin.x.subtract(o1.x).val(), 10);
  var dy = parseInt(origin.y.subtract(o1.y).val(), 10);
  r1.points.forEach(function(p) {
    points.push(new Point(p.x - dx, p.y - dy));
  });

  dx = parseInt(origin.x.subtract(o2.x).val(), 10);
  dy = parseInt(origin.y.subtract(o2.y).val(), 10);
  r2.points.forEach(function(p) {
    points.push(new Point(p.x - dx, p.y - dy));
  });

  var reg = new Region(rect, points);
  //console.log(r1.toString(), ' + ', r2.toString(), '  ==>  ', reg.toString());
  return reg;
}


class Game {

  /**
   *
   * @param width {BigNum}
   * @param height {BigNum}
   */
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.regions = [];
  }

  /**
   *
   * @param point {Point}
   */
  addPoint(point) {
    var origin = new Point(BigNum(point.x.val()).subtract(1), BigNum(point.y.val()).subtract(1));
    var size = new Size(3, 3);
    var rect = new Rect(origin, size);
    var region = new Region(rect, [new Point(1, 1)]);
    this.regions.push(region);
  }

  addCell(x, y) {
    this.addPoint(new Point( BigNum(x), BigNum(y) ));
  }

  addGlider(x, y) {
    this.addCell(x + 1, y);
    this.addCell(x + 2, y + 1);
    this.addCell(x, y + 2);
    this.addCell(x + 1, y + 2);
    this.addCell(x + 2, y + 2);
  }

  addReverseGlider(x, y) {
    this.addCell(x + 1, y);
    this.addCell(x, y + 1);
    this.addCell(x, y + 2);
    this.addCell(x + 1, y + 2);
    this.addCell(x + 2, y + 2);
  }

  merge() {
    this.regions = mergeRegions(this.regions);
  }

  mutate() {
    this.regions = this.regions.map(x => x.mutate());
  }

}


module.exports = Game;
