var React = require('react');
var PureRender = require('react/lib/ReactComponentWithPureRenderMixin');
var classSet = require('react/lib/cx');

var Long = require('long');
var Numeral = require('numeral');
var debounce = require('debounce');

var Region = require('./../Region');
var Game = require('./../Game');
var Rect = require('../geometry/Rect');
var geometry = require('../geometry');

var Button = require('./Button');

require('./GameUI.styl');


var PATTERNS = [
  require('../../patterns/pulsar.cells'),
  require('../../patterns/p54shuttle.cells'),
  require('../../patterns/p42glidershuttle.cells'),
  require('../../patterns/blinkerfuse.cells'),
  require('../../patterns/fly.cells'),
  require('../../patterns/crab.cells'),
  require('../../patterns/canadagoose.cells'),
  require('../../patterns/enterprise.cells'),
  require('../../patterns/seal.cells'),
  require('../../patterns/gosperglidergun.cells'),
  require('../../patterns/glider.cells'),
  require('../../patterns/gliderloop.cells')
];


var Cell = React.createClass({

  mixins: [PureRender],

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
    return <div className='Cell' style={{transform: `translate(${x}px, ${y}px)`, width: size, height: size, borderRadius}} />;
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

    // FIXME do not calculate screen position before intersection check
    var screenX = r.rect.left.subtract(this.props.x).toInt() * px;
    var screenY = r.rect.top.subtract(this.props.y).toInt() * px;
    var screenWidth = r.rect.width * px;
    var screenHeight = r.rect.height * px;

    var viewport = Rect.make(0, 0, window.innerWidth, window.innerHeight);
    var regionRect = Rect.make(screenX, screenY, screenWidth, screenHeight);

    if (viewport.intersects(regionRect)) {

      var points = [];
      var _width = geometry.width(r.data);
      var _height = geometry.height(r.data);
      for (var x = 0; x < _width; x++) {
        for (var y = 0; y < _height; y++) {
          if (r.data[y][x]) {
            points.push(<Cell key={`${x}x${y}`} pixelSize={px} x={x} y={y} />)
          }
        }
      }

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


var GameUI = React.createClass({

  getInitialState() {
    var game = new Game(Long.MAX_UNSIGNED_VALUE, Long.MAX_UNSIGNED_VALUE);
    game.addShip(Long.fromInt(10), Long.fromInt(10), PATTERNS[0].data);

    return {
      x: Long.fromInt(0),
      y: Long.fromInt(0),
      width: 0,
      height: 0,
      pixelSize: 10,

      timeTaken: 0,
      showRegions: true,
      game: game,
      duration: 50,
      running: false,

      dragging: false,
      draggingFrom: null,
      draggingOrigin: null
    }
  },

  mutate() {
    if (!this.isMounted()) {
      return;
    }

    var start = performance.now();
    this.state.game.mutate();
    var timeTaken = performance.now() - start;
    this.setState({timeTaken});

    this.forceUpdate(function() {
      if (this.state.running) {
        this._runningTimer = setTimeout(this.mutate, this.state.duration);
      }
    }.bind(this));
  },

  start() {
    this.setState({
      running: true
    });
    this.mutate();
  },

  stop() {
    this.setState({
      running: false
    });
    if (this._runningTimer) {
      clearTimeout(this._runningTimer);
      this._runningTimer = null;
    }
  },

  reset() {
    this.stop();
    this.setState({
      game: new Game(Long.MAX_UNSIGNED_VALUE, Long.MAX_UNSIGNED_VALUE)
    })
  },

  captureMouse(e) {
    e.stopPropagation();
  },

  setPixelSize(e) {
    var pixelSize = parseInt(e.target.value);
    if (!isNaN(pixelSize) && pixelSize >= 1 && pixelSize <= 40) {
      this.setState({pixelSize}, this.updateViewportSize);
    }
  },

  visualCenter() {
    return {
      x: this.state.x.add(Math.floor(this.state.width / 2)),
      y: this.state.y.add(Math.floor(this.state.height / 2))
    };
  },

  setDuration(e) {
    var duration = parseInt(e.target.value);
    if (!isNaN(duration) && duration >= 30 && duration <= 10000) {
      this.setState({duration});
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
    this.updateViewportSize();
  }, 50),

  updateViewportSize() {
    this.setState({
      width: Math.ceil(window.innerWidth / this.state.pixelSize),
      height: Math.ceil(window.innerHeight / this.state.pixelSize)
    });
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState.pixelSize != this.state.pixelSize) {
      this.renderGrid();
    }
  },

  componentDidMount() {
    this.renderGrid();
    this.updateViewportSize();
    window.addEventListener('resize', this.handleWindowResize);
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  },

  addShip(data) {
    var shipWidth = data[0].length;
    var shipHeight = data.length;
    var center = this.visualCenter();
    this.state.game.addShip(
      center.x.subtract(Math.floor(shipWidth / 2)),
      center.y.subtract(Math.floor(shipHeight / 2)),
      data
    );
    this.forceUpdate();
  },

  startDragging(e) {
    if (!this.state.dragging) {
      this.setState({
        dragging: true,
        draggingOrigin: {
          x: this.state.x,
          y: this.state.y
        },
        draggingFrom: {
          x: e.clientX,
          y: e.clientY
        }
      });
      document.addEventListener('mouseup', this.stopDragging);
      document.addEventListener('mousemove', this.dragMove);
    }
  },

  dragMove: debounce(function(e) {
    e.preventDefault();
    var nx = this.state.draggingOrigin.x.add( Math.round((this.state.draggingFrom.x - e.clientX) / this.state.pixelSize) );
    var ny = this.state.draggingOrigin.y.add( Math.round((this.state.draggingFrom.y - e.clientY) / this.state.pixelSize) );
    if (nx.lessThan(0)) {
      nx = Long.fromInt(0);
    }
    if (ny.lessThan(0)) {
      ny = Long.fromInt(0);
    }
    this.setState({
      x: nx,
      y: ny
    });
  }, 10),

  stopDragging(e) {
    this.setState({
      dragging: false
    });
    document.removeEventListener('mouseup', this.stopDragging);
    document.removeEventListener('mousemove', this.dragMove);
  },

  render() {

    var regions = this.state.game.regions.map((r, idx) =>
        <RegionUI frame={this.state.showRegions} region={r} key={idx}
                  x={this.state.x} y={this.state.y}
                  pixelSize={this.state.pixelSize} />);

    var shipsMenu = PATTERNS.map(function(ship, idx) {
      return (
        <div key={idx} className='Game-shipButton' onClick={this.addShip.bind(this, ship.data)}>
          {ship.name}
        </div>
      );
    }, this);

    return (
      <div className={classSet({'Game': true, 'Game--dragging': this.state.dragging})}>

        <canvas ref='grid' className='Game-grid' onMouseDown={this.startDragging} />

        <div className='Game-controls' onMouseDown={this.captureMouse}>

          {`${this.state.x.toString()}x${this.state.y.toString()} ${this.state.width}x${this.state.height}`}

          <div>
            <span>pixel size</span>
            <input value={this.state.pixelSize} type='number' onChange={this.setPixelSize} />
          </div>

          <div>
            <span>interval</span>
            <input value={this.state.duration} type='number' onChange={this.setDuration} />
          </div>

          <div className='Game-buttons'>
            <Button disabled={this.state.running} onClick={this.mutate}>mutate</Button>
            <Button disabled={this.state.running} onClick={this.start}>start</Button>
            <Button disabled={!this.state.running} onClick={this.stop}>stop</Button>
            <Button onClick={this.reset}>reset</Button>
          </div>

          <div>
            <label htmlFor='id-show-regions'>show regions</label>
            <input type='checkbox' onChange={this.setShowRegions} checked={this.state.showRegions} />
          </div>

          <div>time taken {Numeral(this.state.timeTaken).format('0.00')}ms</div>
          <div>generation {this.state.game.generation}</div>

          <div className='Game-shipsMenu'>
            {shipsMenu}
          </div>

        </div>
        {regions}
      </div>
    );
  }

});

module.exports = GameUI;
