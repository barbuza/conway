'use strict';

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
Region.prototype.intersects = function(other) {
  return this.rect.intersects(other.rect);
};


/**
 * @param {Point} origin
 * @param {Array.<Array.<number>>} patternData
 * @return {Region}
 */
Region.fromPattern = function (origin, patternData) {
  var data = geometry.clone(patternData);
  geometry.ensurePadding(data, 1);
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
    var expandLeft = 1 - paddings.left;
    var expandRight = 1 - paddings.right;
    var expandTop = 1 - paddings.top;
    var expandBottom = 1 - paddings.bottom;

    geometry.expandLeft(next, expandLeft);
    geometry.expandRight(next, expandRight);
    geometry.expandTop(next, expandTop);
    geometry.expandBottom(next, expandBottom);

    var origin = this.rect.origin.translate(-expandLeft, -expandTop);

    var width = this.rect.size.width + expandLeft + expandRight;
    var height = this.rect.size.height + expandTop + expandBottom;

    var rect = new Rect(origin, new Size(width, height));

    // FIXME support region splitting
    // TODO add periodic checks
    return [new Region(rect, next)];
  }
};


module.exports = Region;
