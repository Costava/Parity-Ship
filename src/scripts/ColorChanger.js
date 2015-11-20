/*
 * @param {number} time - in milliseconds
 */
function ColorChanger(initColor, finalColor, time, target) {
	this.initColor = initColor;
	this.finalColor = finalColor;

	// value to change the applicable color component by per millisecond
	// this.dr = finalColor.r - initColor.r / time;//replaced by forEach
	var self = this;
	['r', 'g', 'b', 'a'].forEach(function(letter, index, letters) {
		self['d'+letter] = (finalColor[letter] - initColor[letter]) / time;
	});

	this.totalTime = time;
	this.timeLeft = this.totalTime;
	this.target = target;

	// to call when totalTime changed
	this.callback = function() {console.log('Done');};
}

/*
 * @param {number} dt - in milliseconds
 */
ColorChanger.prototype.change = function(dt) {
	if (this.timeLeft > 0) {
		// console.log('dt', dt);

		if (dt < this.timeLeft) {
			var self = this;
			['r', 'g', 'b', 'a'].forEach(function(letter, index, letters) {
				self.target.color[letter] += self['d'+letter] * dt;
			});

			// console.log('bc', this.target.color);
			this.target.color.clamp();
			// console.log('ac', this.target.color);

			this.timeLeft -= dt;
		}
		else {//dt is greater than or equal to timeLeft
			this.target.color = this.finalColor;

			this.timeLeft = 0;

			this.callback();
		}
	}
};

module.exports = ColorChanger;
