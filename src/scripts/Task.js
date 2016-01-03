/*
 * Object with properties about doing {function} callback at {number} time (milliseconds)
 */
function Task(time, callback) {
	this.time = time;
	this.callback = callback;
}

module.exports = Task;
