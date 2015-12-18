// speed is vector2d with speeds per millisecond
function Ship(pos, radius, sideLength, color, speed) {
	this.pos = pos;
	this.radius = radius;
	this.sideLength = sideLength;
	this.outerColor = color;
	this.innerColor = color.inverse();
	this.innerColor.a = 1;// make inner fully opaque

	this.speed = speed;
	this.hit = false;
}

Ship.prototype.draw = function(ctx) {
	ctx.save();

	ctx.translate(this.pos.x, this.pos.y);
	this._draw(ctx);

	ctx.restore();
}

Ship.prototype._draw = function(ctx) {
	ctx.save();

	ctx.beginPath();
	ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
	ctx.fillStyle = this.outerColor.toString();
	ctx.fill();
	ctx.closePath();

	ctx.beginPath();
	ctx.rect(-this.sideLength/2, -this.sideLength/2, this.sideLength, this.sideLength);
	ctx.fillStyle = this.innerColor.toString();
	ctx.fill();
	ctx.closePath();

	ctx.restore();
};

module.exports = Ship;
