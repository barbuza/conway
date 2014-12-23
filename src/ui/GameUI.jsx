var React = require('react');
var classSet = require('react/lib/cx');

var Long = require('long');
var Numeral = require('numeral');
var debounce = require('debounce');

var Region = require('./../Region');
var Game = require('./../Game');
var geometry = require('../geometry');
var subtractUnsignedLong = require('../subtractUnsignedLong');

var Api = require('../api');

var Button = require('./Button.jsx');
var Grid = require('./Grid.jsx');
var Area = require('./Area.jsx');


require('./GameUI.styl');


var PATTERNS = [
  require('../../patterns/4gliders.cells'),
  require('../../patterns/pulsar.cells'),
  require('../../patterns/p54shuttle.cells'),
  require('../../patterns/p42glidershuttle.cells'),
  require('../../patterns/blinkerfuse.cells'),
  require('../../patterns/fly.cells'),
  require('../../patterns/crab.cells'),
  require('../../patterns/canadagoose.cells'),
  require('../../patterns/enterprise.cells'),
  require('../../patterns/seal.cells'),
  require('../../patterns/glider.cells'),
  require('../../patterns/77p6h1v1.cells'),
  require('../../patterns/gosperglidergun.cells')
];


var GameUI = React.createClass({

  getInitialState() {
    var game = new Game(Long.MAX_UNSIGNED_VALUE, Long.MAX_UNSIGNED_VALUE);
    var px = 7;

    return {
      x: Long.MAX_UNSIGNED_VALUE.div(2).toUnsigned(),
      y: Long.MAX_UNSIGNED_VALUE.div(2).toUnsigned(),
      width: Math.ceil(window.innerWidth / px),
      height: Math.ceil(window.innerHeight / px),
      pixelSize: px,

      timeTaken: 0,
      showRegions: false,
      game: game,
      duration: 200,
      useFrames: false,
      running: false,

      dragging: false,
      draggingFrom: null,
      draggingOrigin: null,

      showMenu: true
    }
  },

  componentWillMount() {
    this.addShip(require('../../patterns/4gliders.cells').data);
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
        if (this.state.useFrames) {
          requestAnimationFrame(this.mutate);
        } else {
          this._runningTimer = setTimeout(this.mutate, this.state.duration);
        }
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

  /**
   * @param {SyntheticMouseEvent} e
   */
  captureMouse(e) {
    e.stopPropagation();
  },

  /**
   * @param {SyntheticInputEvent|WheelEvent} e
   */
  setPixelSize(e) {
    var center = this.visualCenter();
    var pixelSize;

    if (e.target === this.refs.pixelInput.getDOMNode()) {
      pixelSize = parseInt(e.target.value);
    } else {
      // FIXME overflow
      center = {
        x: this.state.x.add(Math.round(e.clientX / this.state.pixelSize)),
        y: this.state.y.add(Math.round(e.clientY / this.state.pixelSize))
      };
      if (e.deltaY > 0) {
        pixelSize = this.state.pixelSize - 1;
      } else if (e.deltaY < 0) {
        pixelSize = this.state.pixelSize + 1;
      }
    }

    if (!isNaN(pixelSize) && pixelSize >= 1 && pixelSize <= 40) {
      var x = center.x;
      var y = center.y;

      var w2 = Math.round(window.innerWidth  / (2 * pixelSize));
      var h2 = Math.round(window.innerHeight / (2 * pixelSize));

      if (x.lessThan(w2)) {
        x = Long.UZERO;
      } else if (Long.MAX_UNSIGNED_VALUE.subtract(x).lessThan(w2)) {
        x = Long.MAX_UNSIGNED_VALUE.subtract(w2 * 2);
      } else {
        x = x.subtract(w2);
      }

      if (y.lessThan(h2)) {
        y = Long.UZERO;
      } else if (Long.MAX_UNSIGNED_VALUE.subtract(y).lessThan(h2)) {
        y = Long.MAX_UNSIGNED_VALUE.subtract(h2 * 2);
      } else {
        y = y.subtract(h2);
      }

      var width = Math.ceil(window.innerWidth / pixelSize);
      var height = Math.ceil(window.innerHeight / pixelSize);

      this.setState({x, y, pixelSize, width, height});
    }
  },


  /**
   * @return {{x: Long, y: Long}}
   */
  visualCenter() {
    return {
      x: this.state.x.add(Math.floor(this.state.width / 2)).toUnsigned(),
      y: this.state.y.add(Math.floor(this.state.height / 2)).toUnsigned()
    };
  },

  /**
   * @param {SyntheticInputEvent} e
   */
  setDuration(e) {
    var duration = parseInt(e.target.value);
    if (!isNaN(duration) && duration >= 30 && duration <= 10000) {
      this.setState({duration});
    }
  },

  /**
   * @param {SyntheticInputEvent} e
   */
  setShowRegions(e) {
    var showRegions = e.target.checked;
    this.setState({showRegions});
  },

  /**
   * @param {SyntheticInputEvent} e
   */
  setUseFrames(e) {
    var useFrames = e.target.checked;
    this.setState({useFrames});
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
    this.debouncedResize = debounce(this.setPixelSize, 10);
    window.addEventListener('wheel', this.debouncedResize);
    window.addEventListener('resize', this.handleWindowResize);
  },

  componentWillUnmount() {
    window.removeEventListener('wheel', this.debouncedResize);
    window.removeEventListener('resize', this.handleWindowResize);
  },

  /**
   * @param {Array.<Array.<number>>} data
   */
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
      document.addEventListener('mousemove', this.dragMove, false);
    }
  },

  dragMove: debounce(function (e) {
    e.preventDefault();

    var ox = this.state.draggingOrigin.x;
    var oy = this.state.draggingOrigin.y;

    var dx = Math.round((this.state.draggingFrom.x - e.clientX) / this.state.pixelSize);
    var dy = Math.round((this.state.draggingFrom.y - e.clientY) / this.state.pixelSize);

    var nx, ny;

    if (dx < 0 && ox.lessThan(-dx)) {
      nx = Long.UZERO;
    } else if (dx > 0 && Long.MAX_UNSIGNED_VALUE.subtract(dx).lessThan(ox)) {
      nx = Long.MAX_UNSIGNED_VALUE;
    } else {
      nx = ox.add(dx);
    }

    if (dy < 0 && oy.lessThan(-dy)) {
      ny = Long.UZERO;
    } else if (dy > 0 && Long.MAX_UNSIGNED_VALUE.subtract(dy).lessThan(oy)) {
      ny = Long.MAX_UNSIGNED_VALUE;
    } else {
      ny = oy.add(dy);
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


  /**
   * @return {ReactElement}
   */
  renderMenuCollapsed() {
    return (
      <div className='Game-controls Game-controls--collapsed' onMouseDown={this.captureMouse}>
        <div className='Game-controls-toggle' onClick={this.toggleMenu}>expand</div>
      </div>
    );
  },

  /**
   * @return {ReactElement}
   */
  renderMenuExpanded() {
    var shipsMenu = PATTERNS.map(function (ship, idx) {
      return (
        <div key={idx} className='Game-shipButton' onClick={this.addShip.bind(this, ship.data)}>
          {ship.name}
        </div>
      );
    }, this);

    var center = this.visualCenter();
    var viewport = `${this.state.x}x${this.state.y} ${this.state.width}x${this.state.height}`;

    return (
      <div className='Game-controls Game-controls--expanded' onMouseDown={this.captureMouse} onWheel={this.captureMouse}>
        <div className='Game-viewport'>{viewport}</div>
        <div className='Game-controls-row'>
          <label htmlFor='id-pixel-size'>pixel size</label>
          <input ref='pixelInput' id='id-pixel-size' value={this.state.pixelSize} type='number' onChange={this.setPixelSize} />
        </div>
        <div className='Game-controls-row'>
          <label htmlFor='id-interval'>interval</label>
          <input id='id-interval' disabled={this.state.useFrames} value={this.state.duration} type='number' onChange={this.setDuration} />
        </div>
        <div className='Game-controls-row'>
          <label htmlFor='id-use-frames'>each frame</label>
          <input id='id-use-frames' checked={this.state.useFrames} type='checkbox' onChange={this.setUseFrames} />
        </div>
        <div className='Game-controls-row'>
          <label htmlFor='id-show-regions'>show regions</label>
          <input id='id-show-regions' type='checkbox' onChange={this.setShowRegions} checked={this.state.showRegions} />
        </div>
        <div className='Game-buttons'>
          <Button disabled={this.state.running} onClick={this.mutate}>mutate</Button>
          <Button disabled={this.state.running} onClick={this.start}>start</Button>
          <Button disabled={!this.state.running} onClick={this.stop}>stop</Button>
          <Button onClick={this.reset}>reset</Button>
        </div>
        <div>time taken {Numeral(this.state.timeTaken).format('0.00')}ms</div>
        <div>generation {this.state.game.generation}</div>
        <div className='Game-shipsMenu'>
            {shipsMenu}
        </div>
        <div className='Game-buttons'>
          <Button
            disabled={this.state.running || this.state.saving || this.state.loading}
            onClick={this.save}>{this.state.saving ? 'saving...' : 'save'}</Button>
          <Button
            disabled={this.state.running || this.state.saving || this.state.loading}
            onClick={this.load}>{this.state.loading ? 'loading...' : 'load'}</Button>
        </div>
        <div className='Game-controls-toggle' onClick={this.toggleMenu}>collapse</div>
      </div>
    );
  },

  toggleMenu() {
    this.setState({
      showMenu: !this.state.showMenu
    });
  },

  save() {
    this.setState({
      saving: true
    });

    var regions = this.state.game.regions.map(function(region) {
      return {
        x: region.rect.left.toString(),
        y: region.rect.top.toString(),
        data: geometry.clone(region.data)
      };
    });

    Api.storeGame({
      x: this.state.x.toString(),
      y: this.state.y.toString(),
      pixelSize: this.state.pixelSize,
      generation: this.state.game.generation,
      regions: regions
    }).then(function(gameId) {

      alert('your game id is ' + gameId);

    }).catch(function(e) {

      alert('game was not saved ;[')
      console.log(e);

    }).finally(function() {
      if (this.isMounted()) {
        this.setState({
          saving: false
        });
      }
    }.bind(this));

  },

  load() {
    this.setState({
      loading: true
    });
    var gameId = prompt('game id ?');
    Api.getData(gameId).then(function({x, y, pixelSize, generation, regions}) {

      var game = new Game(Long.MAX_UNSIGNED_VALUE, Long.MAX_UNSIGNED_VALUE);

      game.regions = regions.map(function({x, y, data}) {
        var origin = new geometry.Point(Long.fromString(x, true, 10), Long.fromString(y, true, 10));
        var size = new geometry.Size(geometry.width(data), geometry.height(data));
        var rect = new geometry.Rect(origin, size);
        return new Region(rect, geometry.clone(data));
      });

      game.generation = generation;

      this.setState({
        running: false,
        x: Long.fromString(x, true, 10),
        y: Long.fromString(y, true, 10),
        pixelSize,
        game
      }, this.updateViewportSize);

    }.bind(this)).catch(function(e) {

      alert('game data loading failed ;{')
      console.log(e);

    }).finally(function() {
      if (this.isMounted()) {
        this.setState({
          loading: false
        });
      }
    }.bind(this));
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
          x: subtractUnsignedLong(region.rect.left, x),
          y: subtractUnsignedLong(region.rect.top, y),
          data: region.data,
          still: region.still,
          framed: showRegions,
          pixelSize: pixelSize
        }));
      }
    });

    var className = classSet({
      'Game': true,
      'Game--dragging': this.state.dragging
    });

    return (
      <div className={className} onMouseDown={this.startDragging}>
        <Grid pixelSize={this.state.pixelSize} width={this.state.width} height={this.state.height} />
        {this.state.showMenu ? this.renderMenuExpanded() : this.renderMenuCollapsed()}
        {areas}
      </div>
    );
  }

});

module.exports = GameUI;
