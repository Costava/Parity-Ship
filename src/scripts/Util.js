var Util = {};

/*
 * Returns an integer between min and max (both inclusive)
 */
Util.randomInt = function(min, max) {
	return Math.floor(Math.random() * (max-min+1) + min);
}

/*
 * returns random value between {number} min (inclusive) and {number} max (exclusive)
 */
Util.randomInInterval = function(min, max) {
	return Math.random() * (max-min) + min;
}

module.exports = Util;
