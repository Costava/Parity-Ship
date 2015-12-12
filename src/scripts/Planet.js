function Planet(pos, sideLength, color, speed) {
	this.pos = pos;
	this.sideLength = sideLength;
	this.color = color;
	this.speed = speed;
}

Planet.prototype.draw = function(ctx, drawShadow) {
	ctx.save();
	ctx.fillStyle = this.color.floored().toString();

	if (drawShadow) {
		ctx.shadowColor = this.color.floored().toString();
		ctx.shadowBlur = 4 * this.sideLength;
	}

	ctx.fillRect(this.pos.x, this.pos.y, this.sideLength, this.sideLength);
	ctx.restore();
};

module.exports = Planet;
