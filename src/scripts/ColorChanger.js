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
		var dtUsed = Math.min(dt, this.timeLeft);

		var self = this;
		['r', 'g', 'b', 'a'].forEach(function(letter) {
			self.target.color[letter] += self['d'+letter] * dtUsed;
		});

		this.target.color.clamp();

		if (dt < this.timeLeft) {
			this.timeLeft -= dt;
		}
		else {//dt is greater than or equal to timeLeft
			this.timeLeft = 0;

			this.callback();
		}
	}
};

module.exports = ColorChanger;
