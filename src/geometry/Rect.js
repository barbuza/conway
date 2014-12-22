'use strict';

var Long = require('long');

var Point = require('./Point');
var Size = require('./Size');


/**
 * @param {Rect} r1
 * @param {Rect} r2
 * @return {boolean}
 * @private
 */
function intersects(r1, r2) {
  return !(
  r2.left.greaterThan(r1.left)
  || r2.right.lessThan(r1.left)
  || r2.top.greaterThan(r1.bottom)
  || r2.bottom.lessThan(r1.top)
  );
}


/**
 * rectangle with long coordinates and native
 *
 * @param {Point} origin
 * @param {Size} size
 * @constructor
 */
function Rect(origin, size) {

  /**
   * @type {Point}
   */
  this.origin = origin;

  /**
   * @type {Size}
   */
  this.size = size;

  /**
   * @member {Long}
   */
  this.left = origin.x;

  /**
   * @member {Long}
   */
  this.top = origin.y;

  /**
   * @member {Long}
   */
  this.right = origin.x.add(size.width);

  /**
   * @member {Long}
   */
  this.bottom = origin.y.add(size.height);

  /**
   * @member {number}
   */
  this.width = size.width;

  /**
   * @member {number}
   */
  this.height = size.height;

  /**
   * @member {Point}
   */
  this.edge = new Point(this.right, this.bottom);
}


/**
 * @param {Rect} other
 * @return {boolean}
 */
Rect.prototype.intersects = function (other) {
  return intersects(this, other) || intersects(other, this);
};


/**
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @return {Rect}
 */
Rect.make = function (x, y, width, height) {
  return new Rect(new Point(Long.fromInt(x, true), Long.fromInt(y, true)), new Size(width, height));
};


module.exports = Rect;
