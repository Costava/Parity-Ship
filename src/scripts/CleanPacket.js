var Color = require('./Color.js');

function CleanPacket(pos) {
	this.pos = pos;

	this.radius = 2;
	this.speed = {x: 0.060, y: 0};
	this.color = new Color(240, 70, 96, 0.9);

	this.hit = false;
}

CleanPacket.prototype.draw = function(ctx) {
	ctx.save();
	ctx.translate(this.pos.x, this.pos.y);
	this._draw(ctx);
	ctx.restore();
};

CleanPacket.prototype._draw = function(ctx) {
	ctx.save();

	ctx.beginPath();
	ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
	ctx.fillStyle = this.color.floored().toString();
	ctx.fill();

	ctx.restore();
}

module.exports = CleanPacket;
