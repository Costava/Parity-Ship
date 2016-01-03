var Vector2 = {};

Vector2.distance = function(v1, v2) {
	return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
};

/*
 * Return magnitude of vector2 v
 */
Vector2.magnitude = function(v) {
	return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
};

/*
 * Rotate v by rads
 */
Vector2.rotate = function(v, rads) {
	var dir = Math.atan2(v.y, v.x);
	dir += rads;

	var x = Math.cos(dir);
	var y = Math.sin(dir);

	var originalMagnitude = Vector2.magnitude(v);

	return {x: x * originalMagnitude, y: y * originalMagnitude};
};

module.exports = Vector2;
