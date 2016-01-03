var Util = require('./Util.js');
var Player = require('./Player.js');
var CleanPacket = require('./CleanPacket.js');
var Vector2 = require('./Vector2.js');
var Task = require('./Task.js');

function Game() {
	this.aspectRatioWidth = 16;
	this.aspectRatioHeight = 9;

	this.menus = {};
	this.currentMenu;
	this.menuShowDuration = '0.5s';
	this.menuHideDuration = '0.2s';

	this.sideShootInterval = 200;// min time between shots in milliseconds
	this.sideShootTime = 0;

	this.centerShootInterval = 400;// milliseconds
	this.centerShootTime = 0;

	// angle (in radians) between center packet and a side packet
	this.shootSideAngle = Math.PI / 7;

	this.newShipIntervalInitial = 400;
	this.newShipIntervalFinal = 46;
	this.newShipInterval = this.newShipIntervalInitial;// time between new ship spawned in milliseconds
	this.newShipTime = 0;

	this.newShipIntervalDiff = 50;
	// time between changing newShipInterval
	this.newShipIncrementInterval = 4000;// milliseconds

	this.fadeBarTime = 800;
	this.cpFadeTime = 300;

	// min- and maxShipSpeed will be changed as game progresses
	this.minShipSpeed = 0.030;
	this.maxShipSpeed = 0.090;
	// lowest and highest possible speed of other ships
	this.shipBotSpeed = this.minShipSpeed;
	this.shipTopSpeed = this.maxShipSpeed;

	// interval to put between min- and maxShipSpeed as increment over time
	this.speedInterval = 0.010;
	// time between difficulty increases
	this.speedIncrementInterval = 4000;// milliseconds

	this.minShipRadius = 2;
	this.maxShipRadius = 5;

	this.newPlanetInterval = 300;
	this.newPlanetTime = 0;

	this.minPlanetLength = 3;
	this.maxPlanetLength = 15;

	this.highScore = 0;

	this.tasks = [];

	this.oldTime = 0;
	this.newTime = 0;
	this.gameTime = 0;

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

Game.prototype.tryShoot = function(pos) {
	if (this.gameTime - this.sideShootTime >= this.sideShootInterval) {
		var packet1 = new CleanPacket({x: pos.x, y: pos.y});
		var packet2 = new CleanPacket({x: pos.x, y: pos.y});

		packet1.speed = Vector2.rotate(packet1.speed, this.shootSideAngle);
		packet2.speed = Vector2.rotate(packet2.speed, -this.shootSideAngle);

		this.cleanPackets.push(packet1);
		this.cleanPackets.push(packet2);

		this.sideShootTime = this.gameTime;
	}

	if (this.gameTime - this.centerShootTime >= this.centerShootInterval) {
		var packet3 = new CleanPacket({x: pos.x, y: pos.y});

		this.cleanPackets.push(packet3);

		this.centerShootTime = this.gameTime;
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
	console.log("Game start");

	this.paused = false;
	this.resuming = false;
	this.inProgress = true;
	this.mousedown = false;

	this.changeMenu();// hide current menu

	document.querySelector('.game-container').style['background-color'] = this.playBackgroundColor;

	this.player = new Player();

	this.ships = [];
	this.cleanPackets = [];// shot by player
	this.corrPackets = [];// shot by ships
	this.colorChangers = [];
	this.fadeBars = [];
	this.planets = [];
	this.tasks = [];

	// check if planets should have shadow
	this.blurCheckbox = document.querySelector('.js-planet-blur');
	this.planetBlur = this.blurCheckbox.checked;

	this.score = 0;

	this.canvas = document.createElement('canvas');
	this.canvas.className = "game-canvas js-game-canvas";
	this.canvasCont = document.querySelector('.js-canvas-container');

	var size = Util.maxChildSize(this.aspectRatio(), this.canvasCont.offsetWidth, this.canvasCont.offsetHeight);
	// console.log(`width: ${size.width}, height: ${size.height}`);
	size.width = Math.ceil(size.width);
	size.height = Math.ceil(size.height);
	// console.log(`width: ${size.width}, height: ${size.height}`);

	this.canvas.style.width = size.width;
	this.canvas.style.height = size.height;
	this.canvas.width = size.width;
	this.canvas.height = size.height;

	this.ctx = this.canvas.getContext('2d');

	// clear canvas container and add canvas
	this.canvasCont.innerHTML = '';
	this.canvasCont.appendChild(this.canvas);

	this.vh = this.canvas.width / 100;

	//////////// Ease up ship speed
	var numIntervals = Math.floor( (this.shipTopSpeed - this.shipBotSpeed) / this.speedInterval );

	this.minShipSpeed = this.shipBotSpeed;
	this.maxShipSpeed = this.minShipSpeed + this.speedInterval;

	for (var i = 0; i < numIntervals; i++) {
		var time = (i + 1) * this.speedIncrementInterval;
		var callback = (function(n) {
			return function() {
				this.minShipSpeed = this.shipBotSpeed + (n + 1) * this.speedInterval;
				this.maxShipSpeed = this.minShipSpeed + this.speedInterval;
			};
		})(i).bind(this);

		var task = new Task(time, callback);

		this.tasks.push(task);
	}

	var time = (numIntervals + 1) * this.speedIncrementInterval;
	var callback = function() {
		this.maxShipSpeed = this.shipTopSpeed;
		this.minShipSpeed = this.maxShipSpeed - this.speedInterval;
	}.bind(this);

	var task = new Task(time, callback);

	this.tasks.push(task);

	//////////

	////////// Ease ship spawn speed
	numIntervals = Math.floor( (this.newShipIntervalInitial - this.newShipIntervalFinal) / this.newShipIntervalDiff );

	this.newShipInterval = this.newShipIntervalInitial;

	for (var i = 0; i < numIntervals; i++) {
		var time = (i + 1) * this.newShipIncrementInterval;
		var callback = (function(n) {
			return function() {
				this.newShipInterval = this.newShipIntervalInitial - (n + 1) * this.newShipIntervalDiff;
			};
		})(i).bind(this);

		var task = new Task(time, callback);

		this.tasks.push(task);
	}

	var time = (numIntervals + 1) * this.newShipIncrementInterval;
	var callback = function() {
		this.newShipInterval = this.newShipIntervalFinal;
	}.bind(this);

	var task = new Task(time, callback);

	this.tasks.push(task);

	//////////

	var currentTime = new Date().getTime();
	this.oldTime = currentTime;
	this.gameTime = 0;

	this.newShipTime = this.gameTime - this.newShipInterval;
	this.newPlanetTime = this.gameTime - this.newPlanetInterval;
	this.sideShootTime = this.gameTime + 100;
	this.centerShootTime = this.gameTime + 100;


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
	console.log("Game end");
	
	this.inProgress = false;
	this.looping = false;
	this.paused = false;
	this.resuming = false;

	this.unbindControls(document);

	document.querySelector('.game-container').style['background-color'] = this.menuBackgroundColor;
};

module.exports = Game;
