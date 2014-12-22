'use strict';

var Long = require('long');


/**
 * point with long coordinates
 *
 * @param {Long} x
 * @param {Long} y
 * @constructor
 */
function Point(x, y) {
  this.x = x;
  this.y = y;
}


/**
 * @param {number} dx
 * @param {number} dy
 * @return {Point}
 */
Point.prototype.translate = function (dx, dy) {
  if (!dx && !dy) {
    return this;
  }
  return new Point(this.x.add(dx), this.y.add(dy));
};


module.exports = Point;
