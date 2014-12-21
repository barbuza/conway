var React = require('react');
var classSet = require('react/lib/cx');
var Long = require('long');
var Numeral = require('numeral');
var debounce = require('debounce');
var _ = require('lodash');

var Region = require('./../Region');
var Game = require('./../Game');
var Rect = require('../geometry/Rect');

require('./GameUI.styl');


var PointUI = React.createClass({

  propTypes: {
    pixelSize: React.PropTypes.number.isRequired,
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired
  },

  render() {
    var px = this.props.pixelSize ;
    var size = px;
    var x = this.props.x * px;
    var y = this.props.y * px;
    var borderRadius = 0;
    if (px > 6) {
      size -= 2;
      x += 1;
      y += 1;
    }
    if (px > 8) {
      borderRadius = 2;
    }
    return <div className='Point' style={{transform: `translate(${x}px, ${y}px)`, width: size, height: size, borderRadius}} />;
  }

});


var RegionUI = React.createClass({

  propTypes: {
    region: React.PropTypes.instanceOf(Region).isRequired,
    pixelSize: React.PropTypes.number.isRequired,
    x: React.PropTypes.instanceOf(Long).isRequired,
    y: React.PropTypes.instanceOf(Long).isRequired
  },

  render() {
    var r = this.props.region;
    var px = this.props.pixelSize;
    var screenX = r.rect.left.subtract(this.props.x).toInt() * px;
    var screenY = r.rect.top.subtract(this.props.y).toInt() * px;
    var screenWidth = r.rect.width * px;
    var screenHeight = r.rect.height * px;

    var viewport = Rect.make(0, 0, window.innerWidth, window.innerHeight);
    var regionRect = Rect.make(screenX, screenY, screenWidth, screenHeight);

    if (viewport.intersects(regionRect)) {

      var points = r.points.map((point, idx) => <PointUI key={idx} pixelSize={px} x={point.x} y={point.y} />);

      var className = classSet({
        'Region': true,
        'Region--withFrame': this.props.frame,
        'Region--still': r.still
      });

      return (
        <div className={className} style={{
          transform: `translate3D(${screenX}px, ${screenY}px, -1px)`,
          width: screenWidth,
          height: screenHeight
        }}>
          {points}
        </div>
      );

    } else {

      return null;

    }
  }

});


var SHIPS = {
  pulsar: require('../../patterns/pulsar.cells'),
  p54shuttle: require('../../patterns/p54shuttle.cells'),
  p42glidershuttle: require('../../patterns/p42glidershuttle.cells')
};


var GameUI = React.createClass({

  getInitialState() {
    var game = new Game(Long.MAX_UNSIGNED_VALUE, Long.MAX_UNSIGNED_VALUE);
    game.addShip(10, 10, SHIPS.pulsar);

    return {
      x: Long.fromInt(0),
      y: Long.fromInt(0),
      pixelSize: 10,
      timeTaken: 0,
      showRegions: true,
      game: game
    }
  },

  merge() {
    this.state.game.merge();
    this.forceUpdate();
  },

  mutate() {
    var start = performance.now();
    this.state.game.merge();
    this.state.game.mutate();
    var timeTaken = performance.now() - start;
    this.setState({timeTaken});
    this.forceUpdate();
  },

  start() {
    requestAnimationFrame(function() {
      this.mutate();
      setTimeout(function() {
        this.start();
      }.bind(this), 100);
    }.bind(this));
  },

  captureMouse(e) {
    e.stopPropagation();
  },

  setPixelSize(e) {
    var pixelSize = parseInt(e.target.value);
    if (!isNaN(pixelSize) && isFinite(pixelSize) && pixelSize >= 2 && pixelSize <= 40) {
      this.setState({pixelSize});
    }
  },

  setShowRegions(e) {
    var showRegions = e.target.checked;
    this.setState({showRegions});
  },

  renderGrid() {
    var canvas = this.refs.grid.getDOMNode();
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var px = this.state.pixelSize;
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

  handleWindowResize: debounce(function() {
    this.renderGrid();
  }, 50),

  componentDidUpdate(prevProps, prevState) {
    if (prevState.pixelSize != this.state.pixelSize) {
      this.renderGrid();
    }
  },

  componentDidMount() {
    this.renderGrid();
    window.addEventListener('resize', this.handleWindowResize);
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  },

  setShip(data) {
    var game = new Game(Long.MAX_UNSIGNED_VALUE, Long.MAX_UNSIGNED_VALUE);
    game.addShip(10, 10, data);
    this.setState({game});
  },

  render() {

    var regions = this.state.game.regions.map((r, idx) =>
        <RegionUI frame={this.state.showRegions} region={r} key={idx}
                  x={this.state.x} y={this.state.y}
                  pixelSize={this.state.pixelSize} />);

    var shipsMenu = _.map(SHIPS, function(data, name) {
      return (
        <div key={name} className='Game-shipButton' onClick={this.setShip.bind(this, data)}>
        {name}
        </div>
      );
    }, this);

    return (
      <div className='Game'>
        <canvas ref='grid' className='Game-grid' />
        <div className='Game-controls' onMouseDown={this.captureMouse}>
          <div>
            <span>pixel size</span>
            <input value={this.state.pixelSize} type='number' onChange={this.setPixelSize} />
          </div>
          <button onClick={this.merge}>merge</button>
          <button onClick={this.mutate}>mutate</button>
          <button onClick={this.start}>start</button>
          <div>
            <label htmlFor='id-show-regions'>show regions</label>
            <input type='checkbox' onChange={this.setShowRegions} checked={this.state.showRegions} />
          </div>
          <div>time taken {Numeral(this.state.timeTaken).format('0.00')}ms</div>
          {shipsMenu}
        </div>
        {regions}
      </div>
    );
  }

});

module.exports = GameUI;
