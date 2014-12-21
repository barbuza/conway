class Size {

  constructor(width, height) {
    this._width = width;
    this._height = height;
  }

  /**
   *
   * @returns {number}
   */
  get width() {
    return this._width;
  }

  /**
   *
   * @returns {number}
   */
  get height() {
    return this._height;
  }

}

module.exports = Size;
