var React = require('react');
var PureRender = require('react/lib/ReactComponentWithPureRenderMixin');
var classSet = require('react/lib/cx');

var Long = require('long');
var Numeral = require('numeral');
var debounce = require('debounce');

var Region = require('./../Region');
var Game = require('./../Game');
var geometry = require('../geometry');

var Button = require('./Button.jsx');
var Grid = require('./Grid.jsx');
var Area = require('./Area.jsx');

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

    this.forceUpdate(function () {
      if (this.state.running) {
        //this._runningTimer = setTimeout(this.mutate, this.state.duration);
        requestAnimationFrame(this.mutate);
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

  handleWindowResize: debounce(function () {
    this.updateViewportSize();
  }, 50),

  updateViewportSize() {
    this.setState({
      width: Math.ceil(window.innerWidth / this.state.pixelSize),
      height: Math.ceil(window.innerHeight / this.state.pixelSize)
    });
  },

  componentDidMount() {
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

  dragMove: debounce(function (e) {
    e.preventDefault();
    var nx = this.state.draggingOrigin.x.add(Math.round((this.state.draggingFrom.x - e.clientX) / this.state.pixelSize));
    var ny = this.state.draggingOrigin.y.add(Math.round((this.state.draggingFrom.y - e.clientY) / this.state.pixelSize));
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

  stopDragging() {
    this.setState({
      dragging: false
    });
    document.removeEventListener('mouseup', this.stopDragging);
    document.removeEventListener('mousemove', this.dragMove);
  },

  render() {

    var {game, x, y, width, height, pixelSize, showRegions} = this.state;

    var screenRect = new geometry.Rect(
      new geometry.Point(x, y),
      new geometry.Size(width, height));

    var areas = [];
    game.regions.forEach(function (region) {
      if (region.rect.intersects(screenRect)) {
        areas.push(Area({
          key: areas.length,
          x: region.rect.left.subtract(x).toInt(),
          y: region.rect.top.subtract(y).toInt(),
          data: region.data,
          still: region.still,
          framed: showRegions,
          pixelSize: pixelSize
        }));
      }
    });

    //var regions = this.state.game.regions.map((r, idx) =>
    //    <RegionUI frame={this.state.showRegions} region={r} key={idx}
    //              x={this.state.x} y={this.state.y}
    //              pixelSize={this.state.pixelSize} />);

    var shipsMenu = PATTERNS.map(function (ship, idx) {
      return (
        <div key={idx} className='Game-shipButton' onClick={this.addShip.bind(this, ship.data)}>
          {ship.name}
        </div>
      );
    }, this);

    var className = classSet({
      'Game': true,
      'Game--dragging': this.state.dragging
    });

    return (
      <div className={className} onMouseDown={this.startDragging}>

        <Grid pixelSize={this.state.pixelSize} width={this.state.width} height={this.state.height} />

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

        {areas}
      </div>
    );
  }

});

module.exports = GameUI;
