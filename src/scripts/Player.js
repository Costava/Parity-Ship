var Color = require('./Color.js');

function Player() {
	this.pos = {}
	this.pos.x = 10;
	this.pos.y = (100/16) * (9/2);// halfway down
	// this.pos.x = 0;
	// this.pos.y = 0;

	this.targetPos = {};
	this.targetPos.x = this.pos.x;
	this.targetPos.y = this.pos.y;

	// max speed player can move in both x and y directions at same time
	// unit is per millisecond
	this.speed = 0.5;

	this.radius = 5;
	this.sideLength = 3;//side length of inner triangle
	this.color = new Color(255, 255, 255, 1);//outer color
	this.innerColor = this.color.inverse();

	this.hits = 0;//number of times hit by corrupt data
}

Player.prototype.move = function(dt) {
	var maxMove = this.speed * dt;

	["x", "y"].forEach(function(prop) {
		var diff = this.targetPos[prop] - this.pos[prop];

		if (maxMove >= Math.abs(diff)) {
			this.pos[prop] = this.targetPos[prop];
		}
		else {
			this.pos[prop] += maxMove * (Math.abs(diff) / diff);
		}
	}.bind(this)/* bind player as this */);
};

/*
 * @param {number} vh - 1% of horizontal length of canvas
 */
Player.prototype.draw = function(ctx) {
	ctx.save();

	ctx.translate(this.pos.x, this.pos.y);
	// ctx.scale(1/ratio, 1/ratio);
	this._draw(ctx);

	ctx.restore();
};

Player.prototype._draw = function(ctx) {
	ctx.save();

	ctx.beginPath();
	ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
	ctx.fillStyle = this.color.floored().toString();
	ctx.fill();
	ctx.closePath();

	ctx.beginPath();
	// Half distance across triangle horizontally
	var halfHorizontal = (this.sideLength / 2) * Math.sqrt(3) / 2;
	ctx.moveTo(-halfHorizontal, -this.sideLength / 2);
	ctx.lineTo(halfHorizontal, 0);
	ctx.lineTo(-halfHorizontal, this.sideLength / 2);
	ctx.fillStyle = this.innerColor.floored().toString();
	ctx.fill();
	ctx.closePath();

	ctx.restore();
};

module.exports = Player;
