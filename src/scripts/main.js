console.log('main.js');

// 70 slashes
//////////////////////////////////////////////////////////////////////

var Util = require('./Util.js');
var Vector2 = require('./Vector2.js');

var Color = require('./Color.js');
var ColorChanger = require('./ColorChanger.js');
var FadeBar = require('./FadeBar.js');

var Player = require('./Player.js');
var Ship = require('./Ship.js');

var CleanPacket = require('./CleanPacket.js');
var Planet = require('./Planet.js');

var Game = require('./Game.js');

//////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////

var game = new Game();

function loop() {
	game.newTime = new Date().getTime();
	game.dt = game.newTime - game.currentTime;

	// check if should make new ship
	if (game.newTime - game.newShipTime > game.newShipInterval) {
		// make new ship
		var x = Math.random() * (3+game.maxShipRadius) + 100;
		var y = Math.random() * game.maxY();

		var radius = Util.randomInInterval(game.minShipRadius, game.maxShipRadius);
		var sideLength = Util.randomInInterval(0.3, 1.2) * radius;

		var speed = Util.randomInInterval(game.minShipSpeed, game.maxShipSpeed);
		speed *= -1;//so that ship goes to left;

		// console.log('ship', x, y);

		var ship = new Ship({x: x, y: y}, radius, sideLength, Color.random(Util.randomInInterval(0.7, 0.9)), {x: speed, y: 0});

		game.ships.push(ship);

		game.newShipTime = game.newTime;
	}

	// check if should make new planet
	if (game.newTime - game.newPlanetTime > game.newPlanetInterval) {
		// make a new planet

		var x = Math.random() * (3+game.maxPlanetLength) + 100;
		var y = Math.random() * game.maxY();

		var sideLength = Util.randomInInterval(game.minPlanetLength, game.maxPlanetLength);
		var color = Color.random(1);

		var mult = 0.25;
		color.r *= mult;
		color.g *= mult;
		color.b *= mult;

		var speed = 0.010 * sideLength;
		speed *= -1;// so planet goes to left

		var planet = new Planet({x: x, y: y}, sideLength, color, {x: speed, y: 0});

		game.planets.push(planet);

		game.newPlanetTime = game.newTime;
	}

	// move player
	game.player.move(game.dt);

	if (game.mousedown) {
		game.tryShoot({x: game.player.pos.x, y: game.player.pos.y}, game.newTime);
	}

	// move planets
	game.planets.forEach(function(planet, index, planets) {
		var dx = planet.speed.x * game.dt;
		var dy = planet.speed.y * game.dt;

		planet.pos.x += dx;
		planet.pos.y += dy;
	});

	// move ships
	game.ships.forEach(function(ship, index, ships) {
		var dx = ship.speed.x * game.dt;
		var dy = ship.speed.y * game.dt;

		ship.pos.x += dx;
		ship.pos.y += dy;
	});

	// move clean packets
	game.cleanPackets.forEach(function(packet, index, packets) {
		var dx = packet.speed.x * game.dt;

		packet.pos.x += dx;
	});

	// remove ships out of bounds
	game.ships.forEach(function(ship, index, ships) {
		// if ship is left of screen or (ship is right and screen and has been hit)
		if (ship.pos.x < 0 || (ship.pos.x > 100 && ship.hits > 0)) {
			game.ships.splice(game.ships.indexOf(ship), 1);
		}
	});

	//remove planets out of bounds
	game.planets.forEach(function(planet, index, planets) {
		if (planet.pos.x < 0){
			game.planets.splice(game.planets.indexOf(planet), 1);
		}
	});

	// check for CleanPacket-ship collisions;
	game.cleanPackets.forEach(function(packet, packetIndex, packets) {
		if (!packet.hit) {
			game.ships.some(function(ship, shipIndex, ships) {
				if (!ship.hit) {
					var distance = Vector2.distance(packet.pos, ship.pos);
					var colDistance = packet.radius + ship.radius;

					if (distance < colDistance) {
						// a ship is contacted!
						ship.hit = true;
						ship.speed.x *= -1.1;

						setTimeout(function() {
							ship.speed.x *= 1.8;
						}, 150);

						packet.hit = true;
						packet.speed.x *= 0.3;

						// packet fades away
						var cc = new ColorChanger(packet.color.clone(), new Color(0, 0, 0, 0), game.cpFadeTime, packet);

						cc.callback = function() {
							game.colorChangers.splice(game.colorChangers.indexOf(this), 1);

							game.cleanPackets.splice(game.cleanPackets.indexOf(packet), 1);
						};

						game.colorChangers.push(cc);

						var f = new FadeBar(game.player, ship, 2.5, ship.innerColor.clone());

						var fFinalColor = new Color(
							(ship.innerColor.r + 255)/2,
							(ship.innerColor.g + 255)/2,
							(ship.innerColor.b + 255)/2,
							0);

						// fadeBar fades
						var ccFadeBar = new ColorChanger(ship.innerColor.clone(), fFinalColor, game.fadeBarTime, f);

						ccFadeBar.callback = function() {
							game.colorChangers.splice(game.colorChangers.indexOf(this), 1);

							game.fadeBars.splice(game.fadeBars.indexOf(this.target), 1);
						};

						game.fadeBars.push(f);
						game.colorChangers.push(ccFadeBar);

						// player changes color;
						var ccPlayer = new ColorChanger(game.player.color.clone(), ship.innerColor.clone(), game.fadeBarTime, game.player);

						ccPlayer.callback = function() {
							game.colorChangers.splice(game.colorChangers.indexOf(this), 1);
						};

						game.colorChangers.push(ccPlayer);

						game.score += 1;

						return true;//break. no need to check rest of ships
					}
				}
			});
		}
	});

	//check for player-ship collisions
	game.ships.some(function(ship, index, ships) {
		var distance = Vector2.distance(game.player.pos, ship.pos);
		var colDistance = game.player.radius + ship.radius;

		// console.log(distance, colDistance);
		if (distance < colDistance) {
			//game over
			console.log('Game over!');
			game.looping = false;

			document.removeEventListener('mousemove', game.TrackMousePos);
			document.removeEventListener('mousedown', game.TrackMousedown);
			document.removeEventListener('mouseup', game.TrackMouseup);
			document.removeEventListener('click', game.ShootListener);

			// stop ship speed step ups that are left
			game.shipSpeedStepUps.forEach(function(step, index, steps) {
				// console.log('clearTimeout');
				window.clearTimeout(step);
			});

			if (game.score > game.highScore) {
				game.highScore = game.score;
				document.querySelector('.js-new').innerHTML = 'New&nbsp;';
			}
			else {
				document.querySelector('.js-new').innerHTML = '';
			}

			document.querySelector('.js-score').innerHTML = game.score;
			document.querySelector('.js-high-score').innerHTML = game.highScore;

			var interval = 10;//milliseconds
			var numIntervals = 100;
			// red overlay
			for (var i = 0; i < numIntervals; i++) {
				setTimeout(function() {
					game.ctx.save();
					game.ctx.fillStyle = 'rgba(230, 54, 60, 0.01)';
					game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
					game.ctx.restore();
				}, i * interval);
			}

			setTimeout(function() {
				game.changeMenu(game.menus.end);
			}, interval * numIntervals + 500);

			// make canvas overlay closer to menu color
			for (var i = 0; i < numIntervals; i++) {
				setTimeout(function() {
					game.ctx.save();
					game.ctx.fillStyle = 'rgba(80, 100, 255, 0.01)';
					game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
					game.ctx.restore();
				}, (interval * numIntervals + 500) + i * interval);
			}

			return true;//stop checking ships
		}
	});

	game.colorChangers.forEach(function(cc, index, ccs) {
		// console.log(cc.target.color.toString());
		cc.change(game.dt);
	});

	//invert inner color of player before drawing
	game.player.innerColor = game.player.color.inverse();

	game.draw();

	game.currentTime = game.newTime;

	if (game.looping) {
		window.requestAnimationFrame(loop);
	}
}////////// End of loop

game.loop = loop;

['main', 'about', /*'pause', */'end'].forEach(function(term) {
	game.menus[term] = document.querySelector(`.js-${term}-menu`);
});

document.querySelector('.js-play-button').addEventListener('click', function() {
	game.startGame();
});

document.querySelector('.js-about-button').addEventListener('click', function() {
	game.changeMenu(game.menus.about);
});
document.querySelector('.js-back-button').addEventListener('click', function() {
	game.changeMenu(game.menus.main);
});

document.querySelector('.js-again-button').addEventListener('click', function() {
	game.startGame();
});

document.querySelector('.js-return-button').addEventListener('click', function() {
	game.changeMenu(game.menus.main);
});

game.changeMenu(game.menus.main);
