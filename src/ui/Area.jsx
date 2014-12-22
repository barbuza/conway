var React = require('react');
var classSet = require('react/lib/cx');

var geometry = require('../geometry');

require('./Area.styl');


/**
 * @type {ReactComponent}
 */
var Area = React.createClass({

  propTypes: {
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
    data: React.PropTypes.instanceOf(Array).isRequired,
    still: React.PropTypes.bool.isRequired,
    framed: React.PropTypes.bool.isRequired,
    pixelSize: React.PropTypes.number.isRequired
  },

  draw() {

    /**
     * @type {HTMLCanvasElement}
     */
    var canvas = this.getDOMNode();
    var context = canvas.getContext('2d');
    var pixelRatio = window['devicePixelRatio'] || 1;
    context.scale(pixelRatio, pixelRatio);
    context.clearRect(0, 0, canvas.width, canvas.height);

    var px = this.props.pixelSize * pixelRatio;
    var data = this.props.data;

    var width = geometry.width(data);
    var height = geometry.height(data);

    canvas.width = width * px;
    canvas.height = height * px;
    canvas.style.width = width * this.props.pixelSize + 'px';
    canvas.style.height = height * this.props.pixelSize + 'px';
    canvas.style.transform = `translate3d(${this.props.x * this.props.pixelSize}px, ${this.props.y * this.props.pixelSize}px, -1px)`;

    var x, y, row;

    for (y = 0; y < height; y++) {
      row = data[y];
      for (x = 0; x < width; x++) {
        if (row[x]) {
          if (px > 6) {
            context.beginPath();
            context.arc(x * px + px /2, y * px + px / 2, px / 2, 0, 2 * Math.PI, false);
            context.fill();
          } else {
            context.rect(x * px, y * px, px, px);
          }

        }
      }
    }

    context.fillStyle = '#000';
    context.fill();
  },

  componentDidUpdate() {
    this.draw();
  },

  componentDidMount() {
    this.draw();
  },

  /**
   * @return {ReactElement}
   */
  render() {
    var className = classSet({
      'Area': true,
      'Area--withFrame': this.props.framed,
      'Area--still': this.props.still
    });
    return <canvas className={className} />;
  }

});


module.exports = React.createFactory(Area);