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
    context.clearRect(0, 0, canvas.width, canvas.height);

    var px = this.props.pixelSize;
    var data = this.props.data;

    var width = geometry.width(data);
    var height = geometry.height(data);

    canvas.width = width * px;
    canvas.height = height * px;

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
    var {x, y, still, framed, pixelSize} = this.props;
    var className = classSet({
      'Area': true,
      'Area--withFrame': framed,
      'Area--still': still
    });
    var style = {
      transform: `translate3d(${x * pixelSize}px, ${y * pixelSize}px, -1px)`
    };
    return <canvas className={className} style={style} />;
  }

});


module.exports = React.createFactory(Area);