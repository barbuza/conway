var React = require('react');
var Long = require('long');

var Region = require('./Region');
var Game = require('./Game');

require('./GameUI.styl');


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
    var points = r.points.map((point, idx) =>
      <div className='Point' key={idx} style={{left: point.x * px, top: point.y * px,  width: px, height: px}} />);
    return (
      <div className='Region' style={{top: screenY, left: screenX, width: screenWidth, height: screenHeight}}>
        {points}
      </div>
    );
  }

});


var GameUI = React.createClass({

  propTypes: {
    game: React.PropTypes.instanceOf(Game).isRequired
  },

  getInitialState() {
    return {
      x: 0,
      y: 0,
      pixelSize: 10
    }
  },

  merge() {
    this.props.game.merge();
    this.forceUpdate();
  },

  mutate() {
    this.props.game.merge();
    this.props.game.mutate();
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

  render() {
    console.log(this.props.game.regions.map(x => x.rect).toString());
    var regions = this.props.game.regions.map((r, idx) =>
        <RegionUI region={r} key={idx} x={Long.fromInt(this.state.x)} y={Long.fromInt(this.state.y)} pixelSize={this.state.pixelSize} />);

    return (
      <div className='Game'>
        <div className='Game-controls'>
          <button onClick={this.merge}>merge</button>
          <button onClick={this.mutate}>mutate</button>
          <button onClick={this.start}>start</button>
        </div>
        {regions}
      </div>
    );
  }

});

module.exports = GameUI;
