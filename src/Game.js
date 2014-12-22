'use strict';

var Long = require('long');

var Point = require('./geometry/Point');
var Size = require('./geometry/Size');
var Rect = require('./geometry/Rect');
var geometry = require('./geometry');
var Region = require('./Region');


/**
 * @param {Region[]} regions
 * @return {Region[]}
 */
function mergeRegions(regions) {
  var regionA, regionB;
  regions = regions.slice(0);
  for (var ri = 0; ri < regions.length; ri++) {
    for (var rs = ri + 1; rs < regions.length; rs++) {
      regionA = regions[ri];
      regionB = regions[rs];
      if (regionA.intersects(regionB)) {
        regions.splice(regions.indexOf(regionA), 1);
        regions.splice(regions.indexOf(regionB), 1);
        regions.push(combineRegions(regionA, regionB));
        return mergeRegions(regions);
      }
    }
  }
  return regions;
}


/**
 * @param {Region} regionA
 * @param {Region} regionB
 * @return {Region}
 */
function combineRegions(regionA, regionB) {
  var r1 = regionA.rect;
  var r2 = regionB.rect;

  var top = r1.top.lessThan(r2.top) ? r1.top : r2.top;
  var bottom = r1.bottom.lessThan(r2.bottom) ? r2.bottom : r1.bottom;
  var left = r1.left.lessThan(r2.left) ? r1.left : r2.left;
  var right = r1.right.lessThan(r2.right) ? r2.right : r1.right;

  var origin = new Point(left, top);

  var width = right.subtract(left).toInt();
  var height = bottom.subtract(top).toInt();

  var rect = new Rect(origin, new Size(width, height));

  var data = geometry.make(width, height);

  var dx = left.subtract(r1.left).toInt();
  var dy = top.subtract(r1.top).toInt();
  geometry.overlay(data, regionA.data, -dx, -dy);

  dx = left.subtract(r2.left).toInt();
  dy = top.subtract(r2.top).toInt();
  geometry.overlay(data, regionB.data, -dx, -dy);

  return new Region(rect, data);
}


/**
 * game field with long size
 *
 * @param {Long} width
 * @param {Long} height
 * @constructor
 */
function Game(width, height) {

  /**
   * @member {Long}
   */
  this.width = width;

  /**
   * @member {Long}
   */
  this.height = height;

  /**
   * @member {Region[]}
   */

  this.regions = [];

  /**
   * @member {number}
   */
  this.generation = 1;

}


/**
 * @param {Long} originX
 * @param {Long} originY
 * @param {Array.<Array.<number>>} data
 */
Game.prototype.addShip = function (originX, originY, data) {
  var shipRegion = Region.fromPattern(new Point(originX, originY), data);
  this.regions.push(shipRegion);
};


Game.prototype.merge = function () {
  this.regions = mergeRegions(this.regions);
};


Game.prototype.mutate = function () {
  this.merge();
  this.regions = this.regions.reduce(function (acc, reg) {
    return acc.concat(reg.mutate());
  }, []);
  this.generation += 1;
}
;


module.exports = Game;
