function FadeBar(obj1, obj2, width, color) {
	this.obj1 = obj1;
	this.obj2 = obj2;
	this.width = width;

	this.color = color;
}

FadeBar.prototype.draw = function(ctx) {
	ctx.save();

	ctx.beginPath();
	ctx.moveTo(this.obj1.pos.x, this.obj1.pos.y);
	ctx.lineTo(this.obj2.pos.x, this.obj2.pos.y);

	ctx.lineWidth = this.width;
	ctx.strokeStyle = this.color.floored().toString();

	ctx.stroke();

	ctx.restore();
};

module.exports = FadeBar;
