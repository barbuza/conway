var React = require('react');
var classSet = require('react/lib/cx');

require('./Button.styl');


var Button = React.createClass({

  propTypes: {
    disabled: React.PropTypes.bool,
    onClick: React.PropTypes.func.isRequired
  },

  onClick() {
    if (!this.props.disabled) {
      this.props.onClick();
    }
  },

  render() {
    var className = classSet({
      'Button': true,
      'Button--disabled': this.props.disabled
    });
    return <div className={className} onClick={this.onClick}>{this.props.children}</div>;
  }

});


module.exports = Button;
