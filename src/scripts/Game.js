var Player = require('./Player.js');

var CleanPacket = require('./CleanPacket.js');

function Game() {
	this.aspectRatioWidth = 16;
	this.aspectRatioHeight = 9;

	this.canvasContainer = document.querySelector('body');

	this.menus = {};
	this.currentMenu;
	this.menuShowDuration = '0.5s';
	this.menuHideDuration = '0.2s';

	this.shootInterval = 400;// min time between shots in milliseconds
	this.shootTime = 0;

	this.newShipInterval = 140;// time between new ship spawned in milliseconds
	this.newShipTime = 0;

	this.fadeBarTime = 800;
	this.cpFadeTime = 300;

	this.minShipSpeed = 0.060;
	this.maxShipSpeed = 0.140;
	this.shipTopSpeed = this.maxShipSpeed;
	// max ship speed will be lowered at start of game and raised back up
	// to shipTopSpeed in increments over time

	this.minShipRadius = 2;
	this.maxShipRadius = 5;

	this.newPlanetInterval = 90;
	this.newPlanetTime = 0;

	this.minPlanetLength = 2;
	this.maxPlanetLength = 6;

	this.highScore = 0;

	this.loop = function() {
		console.log("Default loop call");
	};

	// Return event position relative to canvas in vh unit
	this.EventPos = function(e) {
		var pos = {};
		pos.x = e.clientX - this.canvas.offsetLeft;
		pos.y = e.clientY - this.canvas.offsetTop;

		// convert to vh
		pos.x = pos.x / this.vh;
		pos.y = pos.y / this.vh;

		return pos;
	};

	this.TrackMouse = function(e) {
		// console.log('mouse', e.clientX, e.clientY);//mouse position
		// http://stackoverflow.com/questions/3234256/find-mouse-position-relative-to-element
		// console.log('mouse', e.clientX-game.canvas.offsetLeft, e.clientY-game.canvas.offsetTop);

		var pos = this.EventPos(e);

		if (this.isVhPosOnCanvas(pos)) {
			this.player.targetPos = pos;
		}
	}.bind(this);

	this.ShootMouse = function(e) {
		var pos = this.EventPos(e);

		this.tryShoot(pos);
	}.bind(this);
}

Game.prototype.hideMenu = function(menu) {
	var buttons = menu.querySelectorAll('.js-menu-button');
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].disabled = true;
	}

	menu.style['transition-duration'] = this.menuHideDuration;

	menu.style.top = '-100%';
	menu.style.bottom = '100%';
};

Game.prototype.showMenu = function(menu) {
	var buttons = menu.querySelectorAll('.js-menu-button');
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].disabled = false;
	}

	menu.style['transition-duration'] = this.menuShowDuration;

	menu.style.top = '0';
	menu.style.bottom = '0';
};

/*
 * Change the menu. Hides current menu if menu arg is undefined
 */
Game.prototype.changeMenu = function(menu) {
	if (this.currentMenu != undefined) {
		this.hideMenu(this.currentMenu);
	}

	if (menu != undefined) {
		this.showMenu(menu);

		this.currentMenu = menu;
	}
};

Game.prototype.aspectRatio = function() {
	return this.aspectRatioWidth / this.aspectRatioHeight;
};

// coordinates are in vh, so this returns bottom y value of canvas in vh
Game.prototype.maxY = function() {
	return this.canvas.height / this.vh;
}

Game.prototype.isVhPosOnCanvas = function(pos) {
	if (pos.x >= 0 && pos.x <= 100 && pos.y >= 0 && pos.y <= this.maxY()) {
		return true;
	}

	return false;
};

Game.prototype.tryShoot = function(pos) {
	// console.log('tryShoot');
	var currentTime = new Date().getTime();

	if (currentTime - this.shootTime > this.shootInterval) {
		var packet = new CleanPacket(pos);

		this.cleanPackets.push(packet);

		this.shootTime = currentTime;
	}
};

Game.prototype.startGame = function() {
	this.changeMenu();//hide current menu

	this.player = new Player();

	this.ships = [];
	this.cleanPackets = [];//shot by player
	this.corrPackets = [];//shot by ships
	this.colorChangers = [];
	this.fadeBars = [];
	this.planets = [];

	//check if planets should have shadow
	this.blurCheckbox = document.querySelector('.js-planet-blur');
	this.planetBlur = this.blurCheckbox.checked;

	this.shipSpeedStepUps = [];
	// ^ array of setTimeouts that will ramp up maxShipSpeed.
	//   A list of these must be kept so that they can be stopped if
	//   game ends before all have happened

	this.score = 0;

	this.canvas = document.createElement('canvas');
	this.canvasCont = document.querySelector('.js-canvas-container');
	this.canvasContAspRatio = this.canvasCont.offsetWidth / this.canvasCont.offsetHeight;

	if (this.aspectRatio() == this.canvasContAspRatio) {
		this.canvas.width = this.canvasCont.offsetWidth;
		this.canvas.height = this.canvasCont.offsetHeight;
	}
	else if (this.aspectRatio() < this.canvasContAspRatio) {
		this.canvas.height = this.canvasCont.offsetHeight;
		this.canvas.width = this.canvas.height * this.aspectRatio();
	}
	else if (this.aspectRatio > this.canvasContAspRatio) {
		this.canvas.width = this.canvasCont.offsetWidth;
		this.canvas.height = this.canvas.width / this.aspectRatio();
	}

	this.canvas.style.width = this.canvas.width;
	this.canvas.style.height = this.canvas.height;

	this.ctx = this.canvas.getContext('2d');

	// clear canvas container and add canvas
	this.canvasCont.innerHTML = '';
	this.canvasCont.appendChild(this.canvas);

	this.vh = this.canvas.width/100;

	// game.ctx.save();
	// game.ctx.scale(game.vh, game.vh);
	//
	// game.player.draw(game.ctx);
	//
	// game.ctx.restore();

	document.addEventListener('mousemove', this.TrackMouse);
	(function(self) {
		setTimeout(function(){document.addEventListener('click', self.ShootMouse);}, 100);
	})(this);

	this.currentTime = new Date().getTime();

	this.looping = true;

	//////////// Ease up max ship speed
	//game.maxShipSpeed
	var interval = 1000;//milliseconds between step ups
	var deltaSpeed = 0.012;
	var numIntervals = Math.floor( (this.shipTopSpeed - this.minShipSpeed) / deltaSpeed );

	this.maxShipSpeed = this.shipTopSpeed - (numIntervals * deltaSpeed);

	// numIntervals-1 because the final interval will set game.maxShipSpeed t0 game.shipTopSpeed
	for (var i = 0; i < numIntervals-1; i++) {
		var to = window.setTimeout(function() {
			this.maxShipSpeed += deltaSpeed;

			// console.log('g.mSS', game.maxShipSpeed);
		}, (i+1) * interval);

		this.shipSpeedStepUps.push(to);
		// ^ these will be cleared when game ends in case
		//   game ended before all steps done
	}

	var to = window.setTimeout(function() {
		this.maxShipSpeed = this.shipTopSpeed;
	}, numIntervals * interval);

	this.shipSpeedStepUps.push(to);

	//////////

	this.loop();
};

module.exports = Game;
