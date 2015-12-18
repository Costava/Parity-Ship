var Player = require('./Player.js');

var CleanPacket = require('./CleanPacket.js');

function Game() {
	this.aspectRatioWidth = 16;
	this.aspectRatioHeight = 9;

	this.menus = {};
	this.currentMenu;
	this.menuShowDuration = '0.5s';
	this.menuHideDuration = '0.2s';

	this.shootInterval = 300;// min time between shots in milliseconds
	this.shootTime = 0;
	this.shootIntervalCurrent = 0;

	this.newShipInterval = 95;// time between new ship spawned in milliseconds
	this.newShipTime = 0;
	this.newShipIntervalCurrent = 0;

	this.fadeBarTime = 800;
	this.cpFadeTime = 300;

	this.minShipSpeed = 0.060;
	this.maxShipSpeed = 0.102;
	this.shipTopSpeed = this.maxShipSpeed;
	// max ship speed will be lowered at start of game and raised back up
	// to shipTopSpeed in increments over time

	this.minShipRadius = 2;
	this.maxShipRadius = 5;

	this.newPlanetInterval = 80;
	this.newPlanetTime = 0;

	this.minPlanetLength = 1;
	this.maxPlanetLength = 6;

	this.highScore = 0;

	this.shipSpeedStepUps = [];

	// game container's background color for different situations
	this.playBackgroundColor = 'rgba(91, 112, 179, 1)';
	// ^ When a game is in progress
	this.menuBackgroundColor = '#000';
	// ^ When a menu is up

	this.paused = false;
	this.resuming = false;
	this.inProgress = false;

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

	this.mousedown = false;

	this.TrackMousePos = function(e) {
		var pos = this.EventPos(e);

		if (this.isVhPosOnCanvas(pos)) {
			this.player.targetPos = pos;
		}
	}.bind(this);

	this.ShootListener = function(e) {
		// console.log(e.which, e.button);

		if (e.button === 0/* left click */) {
			var pos = this.EventPos(e);

			this.tryShoot(pos);
		}
	}.bind(this);

	this.PauseListener = function(e) {
		e.preventDefault();

		this.tryTogglePause();

		return false;
	}.bind(this);

	this.TrackLeftMouseDown = function(e) {
		if (e.button === 0/* left click */) {
			this.mousedown = true;
		}
	}.bind(this);

	this.TrackLeftMouseUp = function(e) {
		if (e.button === 0/* left click */) {
			this.mousedown = false;
		}
	}.bind(this);
}

Game.prototype.bindControls = function(target) {
	// console.log("bind");

	target.addEventListener('mousemove', this.TrackMousePos);
	target.addEventListener('click', this.ShootListener);
	target.addEventListener('contextmenu', this.PauseListener);
	target.addEventListener('mousedown', this.TrackLeftMouseDown);
	target.addEventListener('mouseup', this.TrackLeftMouseUp);
};

Game.prototype.unbindControls = function(target) {
	// console.log("unbind");

	target.removeEventListener('mousemove', this.TrackMousePos);
	target.removeEventListener('click', this.ShootListener);
	target.removeEventListener('contextmenu', this.PauseListener);
	target.removeEventListener('mousedown', this.TrackLeftMouseDown);
	target.removeEventListener('mouseup', this.TrackLeftMouseUp);
};

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

Game.prototype.tryShoot = function(pos, currentTime) {
	if (currentTime - this.shootTime > this.shootInterval) {
		var packet = new CleanPacket(pos);

		this.cleanPackets.push(packet);

		this.shootTime = currentTime;
	}
};

Game.prototype._draw = function(ctx) {
	ctx.save();
	ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	ctx.scale(this.vh, this.vh);

	this.planets.forEach(function(planet) {
		planet.draw(ctx, this.planetBlur);
	}.bind(this));

	this.cleanPackets.forEach(function(packet) {
		packet.draw(ctx);
	}.bind(this));

	this.fadeBars.forEach(function(bar) {
		bar.draw(ctx);
	}.bind(this));

	this.player.draw(ctx);

	this.ships.forEach(function(ship) {
		ship.draw(ctx);
	}.bind(this));

	ctx.restore();
};

Game.prototype.draw = function() {
	this._draw(this.ctx);
};

Game.prototype.startGame = function() {
	this.paused = false;
	this.resuming = false;
	this.inProgress = true;
	this.mousedown = false;

	this.changeMenu();//hide current menu

	document.querySelector('.game-container').style['background-color'] = this.playBackgroundColor;

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
	this.canvas.className = "game-canvas js-game-canvas";
	this.canvasCont = document.querySelector('.js-canvas-container');

	function maxChildSize(aspectRatio, containerWidth, containerHeight) {
		var width, height;
		var containerAspectRatio = containerWidth / containerHeight;

		if (aspectRatio == containerAspectRatio) {
			width = containerWidth;
			height = containerHeight;
		}
		else if (aspectRatio < containerAspectRatio) {
			height = containerHeight;
			width = height * aspectRatio;
		}
		else if (aspectRatio > containerAspectRatio) {
			width = containerWidth;
			height = width / aspectRatio;
		}

		return {width: width, height: height};
	}

	var size = maxChildSize(this.aspectRatio(), this.canvasCont.offsetWidth, this.canvasCont.offsetHeight);

	this.canvas.style.width = size.width;
	this.canvas.style.height = size.height;
	this.canvas.width = size.width;
	this.canvas.height = size.height;

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

	//////////// Ease up max ship speed
	var interval = 1000;//milliseconds between step ups
	var deltaSpeed = 0.005;
	var numIntervals = Math.floor( (this.shipTopSpeed - this.minShipSpeed) / deltaSpeed );

	this.maxShipSpeed = this.shipTopSpeed - (numIntervals * deltaSpeed);

	var to;
	// numIntervals-1 because the final interval will set game.maxShipSpeed t0 game.shipTopSpeed
	for (var i = 0; i < numIntervals-1; i++) {
		(function (game) {
			to = window.setTimeout(function() {
				game.maxShipSpeed += deltaSpeed;

				// console.log('g.mSS', game.maxShipSpeed);
			}, (i+1) * interval);
		})(this);

		this.shipSpeedStepUps.push(to);
		// ^ these will be cleared when game ends in case
		//   game ended before all steps done
	}

	(function(game) {
		to = window.setTimeout(function() {
			game.maxShipSpeed = game.shipTopSpeed;
		}, numIntervals * interval);
	})(this);

	this.shipSpeedStepUps.push(to);

	//////////

	var currentTime = new Date().getTime();

	this.newShipTime = currentTime - this.newShipInterval;
	this.newPlanetTime = currentTime - this.newPlanetInterval;
	this.shootTime = currentTime + 100;
	this.oldTime = currentTime;

	this.bindControls(document);

	this.looping = true;

	this.loop();
};

Game.prototype.pauseAction = function() {
	document.querySelector('.game-container').style['background-color'] = this.menuBackgroundColor;
	this.canvas.style.transform = "scale(0.8, 0.8)";
};

Game.prototype.resumeAction = function() {
	document.querySelector('.game-container').style['background-color'] = this.playBackgroundColor;
	this.canvas.style.transform = "scale(1, 1)";
};

Game.prototype.pause = function()  {
	this.looping = false;
	this.paused = true;
	this.resuming = false;

	var currentTime = new Date().getTime();

	['shoot', 'newShip'].forEach(function(kind) {
		this[kind + 'IntervalCurrent'] = currentTime - this[kind + 'Time'];
	}.bind(this));

	this.pauseAction();

	document.querySelector('.js-pause-score').innerHTML = this.score;

	this.changeMenu(this.menus.pause);
};

Game.prototype.resume = function() {
	this.resuming = true;

	this.changeMenu();

	this.resumeAction();

	setTimeout(function() {
		var currentTime = new Date().getTime();

		['shoot', 'newShip'].forEach(function(kind) {
			this[kind + 'Time'] = currentTime - this[kind + 'IntervalCurrent'];
		}.bind(this));

		this.oldTime = currentTime;

		this.paused = false;
		this.resuming = false;
		this.looping = true;
		this.loop();
	}.bind(this), 800);
};

Game.prototype.tryTogglePause = function() {
	if (this.inProgress) {
		if (this.paused && !this.resuming) {
			this.resume();
		}
		else if (!this.paused && !this.resuming){
			this.pause();
		}
	}
};

Game.prototype.endGameCleanUp = function() {
	this.inProgress = false;
	this.looping = false;
	this.paused = false;
	this.resuming = false;

	this.unbindControls(document);

	// stop ship speed step ups that are left
	this.shipSpeedStepUps.forEach(function(step) {
		window.clearTimeout(step);
	});

	document.querySelector('.game-container').style['background-color'] = this.menuBackgroundColor;
};

module.exports = Game;
