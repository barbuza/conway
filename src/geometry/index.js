'use strict';

/**
 * @param {Array.<Array.<number>>} data
 * @return {number}
 */
function width(data) {
  return data[0].length;
}


/**
 * @param {Array.<Array.<number>>} data
 * @return {number}
 */
function height(data) {
  return data.length;
}


/**
 * @param {number} width
 * @return {number[]}
 */
function makeRow(width) {
  var row = new Array(width);
  for (var i = 0; i < width; i++) {
    row[i] = 0;
  }
  return row;
}


/**
 * @param {Array.<Array.<number>>} data
 * @param {number} dy
 */
function translateY(data, dy) {
  if (!dy) {
    return;
  }
  var _width = width(data);
  if (dy > 0) {
    for (; dy; dy--) {
      data.pop();
      data.unshift(makeRow(_width));
    }
  } else if (dy < 0) {
    for (; dy; dy++) {
      data.shift();
      data.push(makeRow(_width));
    }
  }
}


/**
 * @param {Array.<Array.<number>>} data
 * @param {number} dx
 */
function translateX(data, dx) {
  if (!dx) {
    return;
  }
  var _height = height(data), i;
  if (dx > 0) {
    for (; dx; dx--) {
      for (i = 0; i < _height; i++) {
        data[i].pop();
        data[i].unshift(0);
      }
    }
  } else {
    for (; dx; dx++) {
      for (i = 0; i < _height; i++) {
        data[i].shift();
        data[i].push(0);
      }
    }
  }
}


/**
 * @param {Array.<Array.<number>>} data
 * @param {number} dx
 * @param {number} dy
 */
function translate(data, dx, dy) {
  translateY(data, dy);
  translateX(data, dx);
}


/**
 * @param {Array.<Array.<number>>} data
 * @param {number} cols
 */
function expandLeft(data, cols) {
  if (!cols) {
    return;
  }
  var _height = height(data);
  var i;
  if (cols > 0) {
    for (; cols; cols--) {
      for (i = 0; i < _height; i++) {
        data[i].unshift(0);
      }
    }
  } else if (cols < 0) {
    for(; cols; cols++) {
      for (i = 0; i < _height; i++) {
        data[i].shift();
      }
    }
  }
}


/**
 * @param {Array.<Array.<number>>} data
 * @param {number} cols
 */
function expandRight(data, cols) {
  if (!cols) {
    return;
  }
  var _height = height(data);
  var i;
  if (cols > 0) {
    for (; cols; cols--) {
      for (i = 0; i < _height; i++) {
        data[i].push(0);
      }
    }
  } else if (cols < 0) {
    for (; cols; cols++) {
      for (i = 0; i < _height; i++) {
        data[i].pop();
      }
    }
  }
}


/**
 * @param {Array.<Array.<number>>} data
 * @param {number} rows
 */
function expandTop(data, rows) {
  if (!rows) {
    return;
  }
  var _width = width(data);
  if (rows > 0) {
    for (; rows; rows--) {
      data.unshift(makeRow(_width));
    }
  } else if (rows < 0) {
    data.splice(0, -rows);
  }
}


/**
 * @param {Array.<Array.<number>>} data
 * @param {number} rows
 */
function expandBottom(data, rows) {
  if (!rows) {
    return;
  }
  var _width = width(data);
  if (rows > 0) {
    for (; rows; rows--) {
      data.push(makeRow(_width));
    }
  } else if (rows < 0) {
    for (; rows; rows++) {
      data.pop();
    }
  }
}


/**
 * @param {number} width
 * @param {number} height
 * @return {Array.<Array.<number>>}
 */
function make(width, height) {
  var data = new Array(height);
  for (var i = 0; i < height; i++) {
    data[i] = makeRow(width);
  }
  return data;
}


/**
 * copies non-zeros from `data` to `dest` at given position
 * @param {Array.<Array.<number>>} dest
 * @param {Array.<Array.<number>>} data
 * @param {?number} [atX=0]
 * @param {?number} [atY=0]
 */
function overlay(dest, data, atX, atY) {
  atX = atX || 0;
  atY = atY || 0;
  var maxX = Math.min(width(dest) - atX, width(data));
  var maxY = Math.min(height(dest) - atY, height(data));
  var x, y;
  for (y = 0; y < maxY; y++) {
    for (x = 0; x < maxX; x++) {
      if (x + atX >=0 && y + atY >= 0 && data[y][x]) {
        dest[y + atY][x + atX] = 1;
      }
    }
  }
}


/**
 * @param {Array.<Array.<number>>} data
 * @return {Array.<Array.<number>>}
 */
function clone(data) {
  var _height = height(data);
  var newData = new Array(_height);
  for (var i = 0; i < _height; i++) {
    newData[i] = data[i].slice(0);
  }
  return newData;
}


/**
 * get padding (zero rows and columns count)
 * @param {Array.<Array.<number>>} data
 * @return {{top:number, right:number, bottom:number, left:number}}
 */
function paddings(data) {
  var _width = width(data);
  var _height = height(data);
  var top = 0, right = 0, bottom = 0, left = 0;
  var x, y, stopIteraction;

  for (y = 0, stopIteraction = false; y < _height; y++) {
    for (x = 0; x < _width; x++) {
      if (data[y][x]) {
        stopIteraction = true;
        break;
      }
    }
    if (stopIteraction) {
      break;
    }
    top ++;
  }

  for (y = _height - 1, stopIteraction = false; y >= 0; y--) {
    for (x = 0; x < _width; x++) {
      if (data[y][x]) {
        stopIteraction = true;
        break;
      }
    }
    if (stopIteraction) {
      break;
    }
    bottom ++;
  }

  for (x = 0, stopIteraction = false; x < _width; x++) {
    for (y = 0; y < _height; y++) {
      if (data[y][x]) {
        stopIteraction = true;
        break;
      }
    }
    if (stopIteraction) {
      break;
    }
    left ++;
  }

  for (x = _width - 1, stopIteraction = false; x >= 0; x--) {
    for (y = 0; y < _height; y++) {
      if (data[y][x]) {
        stopIteraction = true;
        break;
      }
    }
    if (stopIteraction) {
      break;
    }
    right ++;
  }

  return {
    top: top,
    right: right,
    bottom: bottom,
    left: left
  };
}


/**
 * @param {Array.<Array.<number>>} data
 * @param {number} val
 */
function ensurePadding(data, val) {
  var pad = paddings(data);
  expandTop(data, val - pad.top);
  expandBottom(data, val - pad.bottom);
  expandLeft(data, val - pad.left);
  expandRight(data, val - pad.right);
}


module.exports = {
  make: make,
  clone: clone,
  width: width,
  height: height,
  translate: translate,
  translateX: translateX,
  translateY: translateY,
  expandLeft: expandLeft,
  expandRight: expandRight,
  expandTop: expandTop,
  expandBottom: expandBottom,
  overlay: overlay,
  paddings: paddings,
  ensurePadding: ensurePadding,
  Point: require('./Point'),
  Rect: require('./Rect'),
  Size: require('./Size')
};
