var React = require('expose?React!react');
var GameUI = require('./ui/GameUI.jsx');

React.render(<GameUI />, document.getElementById('app'));

require('./api');