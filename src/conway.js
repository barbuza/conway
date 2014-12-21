var Long = require('expose?Long!long');
var React = require('expose?React!react');
var GameUI = require('./GameUI');

var Game = require('./Game');

var game = new Game(Long.MAX_UNSIGNED_VALUE, Long.MAX_UNSIGNED_VALUE);

game.addGlider(3, 3);
game.addReverseGlider(50, 0);
game.addReverseGlider(50, 10);
game.addReverseGlider(50, 20);
game.addReverseGlider(50, 30);

game.merge();

React.render(<GameUI game={game} />, document.getElementById('app'));
