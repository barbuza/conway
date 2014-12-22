var Long = require('long');

var Point = require('./geometry/Point');
var Size = require('./geometry/Size');
var Rect = require('./geometry/Rect');
var Region = require('./Region');


function mergeRegions(regions:Array) : Array {
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


function _mergeRegions(r1:Region, r2:Region) : Region {
  var o1 = r1.rect.origin;
  var o2 = r2.rect.origin;
  var x = o1.x.lessThan(o2.x) ? o1.x : o2.x;
  var y = o1.y.lessThan(o2.y) ? o1.y : o2.y;
  var origin = new Point(x, y);

  var e1 = r1.rect.edge;
  var e2 = r2.rect.edge;
  x = e1.x.greaterThan(e2.x) ? e1.x : e2.x;
  y = e1.y.greaterThan(e2.y) ? e1.y : e2.y;
  var edge = new Point(x, y);

  var width = edge.x.subtract(origin.x).toInt();
  var height = edge.y.subtract(origin.y).toInt();

  var rect = new Rect(origin, new Size(width, height));

  var points = [];

  var dx = origin.x.subtract(o1.x).toInt();
  var dy = origin.y.subtract(o1.y).toInt();

  r1.points.forEach(function(p) {
    points.push(new Point(p.x - dx, p.y - dy));
  });

  dx = origin.x.subtract(o2.x).toInt();
  dy = origin.y.subtract(o2.y).toInt();
  r2.points.forEach(function(p) {
    points.push(new Point(p.x - dx, p.y - dy));
  });

  return new Region(rect, points);
}


class Game {

  constructor(width:Long, height:Long) {
    this.width = width;
    this.height = height;
    this.regions = [];
    this.generation = 1;
  }

  addPoint(point:Point) : void {
    var origin = point.translate(-1, -1);
    var size = new Size(3, 3);
    var rect = new Rect(origin, size);
    var region = new Region(rect, [new Point(1, 1)]);
    this.regions.push(region);
  }

  addCell(x:Number, y:Number) : void {
    this.addPoint(new Point( Long.fromInt(x), Long.fromInt(y) ));
  }

  addShip(originX:Long, originY:Long, data:Object) : void {
    var origin = (new Point(originX, originY)).translate(-1, -1);
    var size = new Size(data[0].length + 2, data.length + 2);
    var rect = new Rect(origin, size);
    var region = new Region(rect, []);

    data.forEach(function(row, y) {
      row.forEach(function(cell, x) {
        if (cell) {
          region.points.push(new Point(x + 1, y + 1));
        }
      }, this);
    }, this);

    this.regions.push(region);
  }

  merge() {
    this.regions = mergeRegions(this.regions);
  }

  mutate() {
    this.regions = this.regions.reduce(function(acc, reg) {
      return acc.concat(reg.mutate());
    }, []);
    this.generation += 1;
  }

}


module.exports = Game;
