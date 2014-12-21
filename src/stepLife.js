function stepLife(next, current) {

  var width = current.shape[0],
    height = current.shape[1],
    x, y, neighbours, dx, dy;

  for (x = 0; x < width; x++) {
    for (y = 0; y < height; y++) {

      neighbours = 0;
      for (dx = -1; dx <= 1; dx ++) {
        for (dy = -1; dy <= 1; dy ++) {
          if (dx === 0 && dy === 0) {
            continue;
          }
          if (x + dx < width && y + dy < height && x + dx >= 0 && y + dy >= 0 ) {
            neighbours += current.get(x + dx, y + dy);
          }
        }
      }

      if (current.get(x, y)) {
        if (neighbours < 2 || neighbours > 3) {
          next.set(x, y, 0);
        }
      } else {
        if (neighbours === 3) {
          next.set(x, y, 1);
        }
      }
    }
  }

}

module.exports = stepLife;
