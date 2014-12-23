'use strict';

var bluebird = require('bluebird');

var Parse = window.Parse;

Parse.initialize("KqPKlHL05Pdm1bvUrgtXZa86fuwe7EGZ3SXaWOLu", "4wlbjCH8MaHUV6TIX2nax7KjpI9tnQKpLJp2kuHc");

var SavedGame = Parse.Object.extend('SavedGame');


/**
 * @param {string} id
 * @return {Promise}
 */
function getData(id) {
  return new bluebird(function(resolve, reject) {
    var query = new Parse.Query(SavedGame);
    query.get(id).then(function(response) {
      resolve(response.attributes);
    }, reject);
  });
}


/**
 * @param {{x:string, y:string, pixelSize:number, regions:Array, generation:number}} data
 * @return {Promise}
 */
function storeGame(data) {
  return new bluebird(function(resolve, reject) {
    var game = new SavedGame();
    return game.save(data).then(function(response) {
      resolve(response.id);
    }, reject);
  });
}


module.exports = {
  getData: getData,
  storeGame: storeGame
};
