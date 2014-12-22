var React = require('react');
var PureRender = require('react/lib/ReactComponentWithPureRenderMixin');

require('./Grid.styl');


var Grid = React.createClass({

  mixins: [PureRender],

  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    pixelSize: React.PropTypes.number.isRequired
  },

  renderGrid() {
    var canvas = this.getDOMNode();
    var context = canvas.getContext('2d');
    var px = this.props.pixelSize;

    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = this.props.width * px;
    canvas.height = this.props.height * px;

    if (px >= 6) {
      for (var x = 0; x < canvas.width; x += px) {
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
      }
      for (var y = 0; y < canvas.height; y += px) {
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
      }
      context.strokeStyle = '#ddd';
      context.stroke();
    }
  },

  componentDidMount() {
    this.renderGrid();
  },

  componentDidUpdate() {
    this.renderGrid();
  },

  render() {
    return <canvas className='Grid' />;
  }

});


module.exports = Grid;
