## naive conway's game of life implementation using divide'n'conquer

## features

* large game field (2^64 x 2^64)
* field is automatically splited into isolated regions those processed independently
* `.cells` file webpack loader - require them right from javascript
* still life detection

## problems

* buggy scroll / zoom behaviour near universe borders
* ugly `long` js workarounds
* slow math - better be backed by binary structures rather that just arrays
* save / load with [Parse](https://www.parse.com) adds 128KB limit, too lazy to do binary packing now

## usage

* firefox or chrome
* ur in the center of the universe
* drag'n'drop to move viewport
* scroll ur wheel to zoom in/out (i.e. change `pixelSize`)
* turn on/off isolated regions highlight
* select between `setTimeout` and `requestAnimationFrame` mode
* click on the name of ship to drop it into viewport center
* load `ILbgPAgMiH` - there are 3 Enterprise ships, one Crab and one 77P6H1V1 (whatever it is)
