var BigNum = require('big-number').n;

var Rect = require('./Rect');
var Point = require('./Point');
var Size = require('./Size');

window.Point = Point;
window.Size = Size;
window.Rect = Rect;

window.BigNum = BigNum;


var Game = require('./Game');

var game = new Game(BigNum(2).pow(64), BigNum(2).pow(64));
//game.addPoint(new Point( BigNum(3), BigNum(1) ));
//game.addPoint(new Point( BigNum(4), BigNum(2) ));
//game.addPoint(new Point( BigNum(4), BigNum(3) ));
//game.addPoint(new Point( BigNum(3), BigNum(3) ));
//game.addPoint(new Point( BigNum(2), BigNum(3) ));

//game.addPoint(new Point( BigNum(10), BigNum(17) ));

game.addGlider(3, 3);
game.addReverseGlider(50, 0);
game.addReverseGlider(50, 10);
game.addReverseGlider(50, 20);
game.addReverseGlider(50, 30);

game.merge();
//console.log(game.regions.toString());

var React = require('react');
var GameUI = require('./GameUI');

//game.mutate();


React.render(<GameUI game={game} />, document.getElementById('app'));
