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

/*
 * @param {number} aspectRatio - of child
 * @param {number} parentWidth - generic unit
 * @param {number} parentHeight
 * @returns {object}
 *  - has width and height properties (in generic unit) of max size of child
 *    having aspectRatio inside parent with parentWidth and -Height
 */
Util.maxChildSize = function(aspectRatio, parentWidth, parentHeight) {
	var width, height;
	var parentAspectRatio = parentWidth / parentHeight;

	if (aspectRatio == parentAspectRatio) {
		width = parentWidth;
		height = parentHeight;
	}
	else if (aspectRatio < parentAspectRatio) {
		height = parentHeight;
		width = height * aspectRatio;
	}
	else if (aspectRatio > parentAspectRatio) {
		width = parentWidth;
		height = width / aspectRatio;
	}

	return {width: width, height: height};
}

module.exports = Util;
