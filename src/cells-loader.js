module.exports = function(source) {
  this.cacheable && this.cacheable();
  source = source.trim();
  var name = null;
  var lines = source.split(/\r?\n/g).filter(function(str) {
    if (str.indexOf('!Name: ') === 0) {
      name = str.slice(7);
    }
    return str[0] !== '!';
  });
  var width = Math.max.apply(null, lines.map(function(line) {
    return line.length;
  }));
  var data = [];
  lines.forEach(function(line) {
    var row = [];
    for (var i = 0; i < width; i++) {
      if (i >= line.length) {
        row.push(0);
      } else {
        row.push(line[i] === 'O' ? 1 : 0);
      }
    }
    data.push(row);
  });
  return JSON.stringify({
    name: name,
    data: data
  });
};
