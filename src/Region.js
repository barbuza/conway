'use strict';

var Long = require('long');

var lifeStep = require('./lifeStep');
var Rect = require('./geometry/Rect');
var Size = require('./geometry/Size');
var Point = require('./geometry/Point');
var geometry = require('./geometry');


/**
 * @param {Rect} rect
 * @param {Array.<Array.<number>>} data
 * @constructor
 */
function Region(rect, data) {

  /**
   * @member {Rect}
   */
  this.rect = rect;

  /**
   * @member {Array.<Array.<number>>}
   */
  this.data = data;

  /**
   * @member {boolean}
   */
  this.still = false;

}


/**
 * @param {Region} other
 * @return {boolean}
 */
Region.prototype.intersects = function (other) {
  if (this.still && other.still) {
    return false;
  }
  return this.rect.intersects(other.rect);
};


/**
 * @param {Point} origin
 * @param {Array.<Array.<number>>} patternData
 * @return {Region}
 */
Region.fromPattern = function (origin, patternData) {
  var data = geometry.clone(patternData);
  geometry.ensurePadding(data, 2);
  var rect = new Rect(origin, new Size(geometry.width(data), geometry.height(data)));
  return new Region(rect, data);
};


/**
 * @return {Region[]}
 */
Region.prototype.mutate = function () {

  if (this.still) {
    return [this];
  }

  var next = geometry.clone(this.data);

  if (!lifeStep(next, this.data)) {

    this.still = true;
    return [this];

  } else {

    var paddings = geometry.paddings(next);
    var expandLeft = 2 - paddings.left;
    var expandRight = 2 - paddings.right;
    var expandTop = 2 - paddings.top;
    var expandBottom = 2 - paddings.bottom;

    // TODO propely handle game world bounds
    if ((expandLeft > 0 && this.rect.left.lessThan(expandLeft))
      || (expandTop > 0 && this.rect.top.lessThan(expandTop))
      || (expandBottom > 0 && Long.MAX_UNSIGNED_VALUE.subtract(expandBottom).lessThan(this.rect.bottom))
      || (expandRight > 0 && Long.MAX_UNSIGNED_VALUE.subtract(expandRight).lessThan(this.rect.right))) {
      console.warn('region went out of game world bounds');
      return [];
    }

    geometry.expandLeft(next, expandLeft);
    geometry.expandRight(next, expandRight);
    geometry.expandTop(next, expandTop);
    geometry.expandBottom(next, expandBottom);

    var origin = this.rect.origin.translate(-expandLeft, -expandTop);

    var width = this.rect.size.width + expandLeft + expandRight;
    var height = this.rect.size.height + expandTop + expandBottom;

    var rect = new Rect(origin, new Size(width, height));

    // TODO add periodic checks
    var region = new Region(rect, next);
    region.shrink();
    return region.split();
  }

};


Region.prototype.shrink = function () {
  var paddings = geometry.paddings(this.data);
  var expandLeft = 2 - paddings.left;
  var expandRight = 2 - paddings.right;
  var expandTop = 2 - paddings.top;
  var expandBottom = 2 - paddings.bottom;

  geometry.expandLeft(this.data, expandLeft);
  geometry.expandRight(this.data, expandRight);
  geometry.expandTop(this.data, expandTop);
  geometry.expandBottom(this.data, expandBottom);

  var origin = this.rect.origin.translate(-expandLeft, -expandTop);

  var width = this.rect.size.width + expandLeft + expandRight;
  var height = this.rect.size.height + expandTop + expandBottom;

  this.rect = new Rect(origin, new Size(width, height));
};


/**
 * @param {number} splitRow
 * @return {Region[]}
 */
Region.prototype.splitAtRow = function(splitRow) {
  var originA = new Point(this.rect.left, this.rect.top);
  var originB = new Point(this.rect.left, this.rect.top.add(splitRow + 2));
  var sizeA = new Size(this.rect.width, splitRow);
  var sizeB = new Size(this.rect.width, this.rect.height - splitRow - 2);
  var dataA = geometry.make(sizeA.width, sizeA.height);
  var dataB = geometry.make(sizeB.width, sizeB.height);
  geometry.overlay(dataA, this.data);
  geometry.overlay(dataB, this.data, 0, -2 - splitRow);
  var regionA = new Region(new Rect(originA, sizeA), dataA);
  var regionB = new Region(new Rect(originB, sizeB), dataB);
  regionA.shrink();
  regionB.shrink();
  return regionA.split().concat(regionB.split());
};


/**
 * @param {number} splitCol
 * @return {Region[]}
 */
Region.prototype.splitAtCol = function(splitCol) {
  var originA = new Point(this.rect.left, this.rect.top);
  var originB = new Point(this.rect.left.add(splitCol + 2), this.rect.top);
  var sizeA = new Size(splitCol, this.rect.height);
  var sizeB = new Size(this.rect.width - splitCol - 2, this.rect.height);
  var dataA = geometry.make(sizeA.width, sizeA.height);
  var dataB = geometry.make(sizeB.width, sizeB.height);
  geometry.overlay(dataA, this.data);
  geometry.overlay(dataB, this.data, - 2 - splitCol, 0);
  var regionA = new Region(new Rect(originA, sizeA), dataA);
  var regionB = new Region(new Rect(originB, sizeB), dataB);
  regionA.shrink();
  regionB.shrink();
  return regionA.split().concat(regionB.split());
};


/**
 * @return {Region[]}
 */
Region.prototype.split = function () {
  var splitRow = geometry.findSplitRow(this.data);
  if (splitRow != -1) {
    return this.splitAtRow(splitRow);
  }
  var splitCol = geometry.findSplitCol(this.data);
  if (splitCol != -1) {
    return this.splitAtCol(splitCol);
  }
  return [this];
};


module.exports = Region;
