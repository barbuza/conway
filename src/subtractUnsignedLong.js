/**
 * @param {Long} longA
 * @param {Long} longB
 * @return {number}
 */
function subtractUnsignedLong(longA, longB) {
  if (longA.greaterThan(longB)) {
    return longA.subtract(longB).toInt();
  } else {
    return - longB.subtract(longA).toInt();
  }
}


module.exports = subtractUnsignedLong;
