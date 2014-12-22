'use strict';

var geomery = require('./geometry');


/**
 * @param {Array.<Array.<number>>} next
 * @param {Array.<Array.<number>>} current
 * @return {boolean}
 */
function lifeStep(next, current) {

  var width = geomery.width(current),
    height = geomery.height(current),
    changed = false,
    x, y, neighbours, dx, dy;

  for (x = 0; x < width; x++) {
    for (y = 0; y < height; y++) {

      neighbours = 0;
      for (dx = -1; dx <= 1; dx++) {
        for (dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) {
            continue;
          }
          if (x + dx < width && y + dy < height && x + dx >= 0 && y + dy >= 0) {
            neighbours += current[y + dy][x + dx] ? 1 : 0;
          }
        }
      }

      if (current[y][x]) {
        if (neighbours < 2 || neighbours > 3) {
          next[y][x] = 0;
          changed = true;
        }
      } else {
        if (neighbours === 3) {
          next[y][x] = 1;
          changed = true;
        }
      }
    }
  }

  return changed;
}


module.exports = lifeStep;
