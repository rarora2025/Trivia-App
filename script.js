let questions = []; // Global Array of Objects (each Object representing a Question)
let stats = {
	questionsAsked: 0,
	correct: 0,
	correctStreak: 0,
	currentTime: null,
	averageResponseTime: 0,
	lead: [],
	time: 1000
}; // Global stats Object

initiateGame(questions, stats);

/*
// Event Handlers
*/

// Handle click events
document.addEventListener("click", function (event) { // This way of handling is useful for dynamically created elements
	if (event.target.classList.contains("quiz-ans-btn")) { // Handle ".quiz-ans-btn" click
		Array.from(document.querySelectorAll(".quiz-ans-btn"))
			.forEach(btn => btn.disabled = true); // Disable buttons
		event.target.blur();
		const choice = Number(event.target.id.split("-")[2]);
		const responseTime = round((new Date() - stats.currentTime) / 1000, 2);
		//stats.averageResponseTime = round((stats.averageResponseTime*(stats.questionsAsked-1) + responseTime)/stats.questionsAsked, 2);
		const points = 1000 / responseTime;

		if (questions[0].answers[choice].isCorrect) {
			event.target.classList.add("pulse", "correct");
			stats.correct++;
			stats.correctStreak++;
			stats.averageResponseTime += points;
			stats.averageResponseTime = round(stats.averageResponseTime, 0);
			setTimeout(() => {
				nextQuestion(questions);
			}, 1250);
		} else {
			event.target.classList.add("shake", "incorrect");
			stats.correctStreak = 0;
			setTimeout(() => {
				const correctAnswerId = "quiz-ans-" + questions[0].answers.findIndex(elem => elem.isCorrect);
				document.querySelector("#" + correctAnswerId)
					.classList.add("correct");
				setTimeout(() => {
					nextQuestion(questions);
				}, 1500);
			}, 750);
		}
		displayStats(stats);
	}
});
// Handle "quiz-play-again-btn" Click (Not a dynamically created element => No need to handle it the same way as ".quiz-ans-btn")
document.querySelector("#quiz-play-again-btn")
	.addEventListener("click", function () {
		document.querySelector("#quiz-play-again-btn")
			.classList.remove("infinite", "pulse");
		document.querySelector("#quiz-play-again-btn")
			.classList.add("flipOutX");
		setTimeout(() => {
			document.querySelector("#quiz-play-again-btn")
				.classList.remove("flipOutX");
			document.querySelector("#quiz-play-again")
				.style.display = "none";
			questions = [];
			stats = { questionsAsked: 0, correct: 0, correctStreak: 0, currentTime: null, averageResponseTime: 0 };
			displayStats(stats);
			initiateGame(questions, stats);
		}, 750);
	});

/*
// Auxiliary Functions
*/

// Initiate New Game
function initiateGame(questions, stats) {

	//fetch("./data.json")
	fetch("https://api.npoint.io/149c04583ba0a8ceefe2")
		.then(response => {
			return response.json();
		})
		.then(function (data) {
			for (let i = 0; i < data.results.length; i++) {
				questions.push({
					category: data.results[i].category,
					difficulty: data.results[i].difficulty,
					type: data.results[i].type,
					question: data.results[i].question,
					answers: createAnswersArray(data.results[i].correct_answer, data.results[i].incorrect_answers)
				});
			}
			displayQuestion(questions[0]);
		})
		.catch(function (error) {
			console.log('Looks like there was a problem: \n', error);
		});
}

// Manipulate API Data structure and return an Answers Array 
function createAnswersArray(correct_answer, incorrect_answers) {
	const totalAnswers = incorrect_answers.length + 1;
	const correct_answer_index = Math.floor(Math.random() * totalAnswers);
	let answersArray = [];
	for (let i = 0; i < incorrect_answers.length; i++) {
		answersArray.push({
			answer: incorrect_answers[i],
			isCorrect: false
		});
	}
	answersArray.splice(correct_answer_index, 0, { answer: correct_answer, isCorrect: true });
	if (totalAnswers === 2) { // => Boolean -> Preferably always show True(1st) - False(2nd) (or Yes - No) -> sort in descending order since both "True" and "Yes" are alphabetically greater than ("False" and "No")
		answersArray.sort((a, b) => a.answer < b.answer);
	}
	return answersArray;
}

// Display Question
function displayQuestion(questionObject) {
	document.querySelector("#quiz-question")
		.innerHTML = questionObject.question;
	document.querySelector("#quiz-question")
		.classList.remove("zoomOut");
	document.querySelector("#quiz-question")
		.classList.add("zoomIn");
	setTimeout(() => {
		document.querySelector("#quiz-question")
			.classList.remove("zoomIn");
		stats.questionsAsked++;
		stats.currentTime = new Date();
	}, 1000);
	for (let i = 0; i < questionObject.answers.length; i++) {
		let button = document.createElement("button");
		button.disabled = true;
		button.id = "quiz-ans-" + i;
		button.classList.add("btn", "quiz-ans-btn", "animated", i % 2 === 0 ? "fadeInLeft" : "fadeInRight");
		button.innerHTML = questionObject.answers[i].answer;
		document.querySelector("#quiz-options")
			.appendChild(button);
		setTimeout(() => {
			button.disabled = false;
			button.classList.remove(i % 2 === 0 ? "fadeInLeft" : "fadeInRight");
		}, 1200);
	}
}

// Remove current question and display next one
function nextQuestion(questions) {
	document.querySelector("#quiz-question")
		.classList.add("zoomOut");
	for (let i = 0; i < questions[0].answers.length; i++) {
		document.querySelector("#quiz-ans-" + i)
			.classList.add(i % 2 === 0 ? "fadeOutLeft" : "fadeOutRight");
	}
	setTimeout(() => {
		const quizOptions = document.querySelector("#quiz-options");
		while (quizOptions.firstChild) { quizOptions.removeChild(quizOptions.firstChild); }
		if (questions.length > 1) {
			questions.shift();
			displayQuestion(questions[0]);
		} else {
			document.querySelector("#quiz-play-again")
				.style.display = "block";
			document.querySelector("#quiz-play-again-btn")
				.classList.add("flipInX");
			setTimeout(() => {
				document.querySelector("#quiz-play-again-btn")
					.classList.remove("flipInX");
				document.querySelector("#quiz-play-again-btn")
					.classList.add("infinite", "pulse");
			}, 1000);
		}
	}, 1000);
}

// Display Stats
function displayStats(stats) {
	document.querySelectorAll("#quiz-stats>div>span")
		.forEach(el => el.classList.add("fadeOut"));
	setTimeout(() => {
		document.querySelector("#rate-span")
			.innerHTML = stats.correct + "/" + stats.questionsAsked;
		document.querySelector("#streak-span")
			.innerHTML = stats.correctStreak;
		document.querySelector("#response-time-span")
			.innerHTML = stats.averageResponseTime;
		document.querySelectorAll("#quiz-stats>div>span")
			.forEach(el => {
				el.classList.remove("fadeOut");
				el.classList.add("fadeIn");
			});
		setTimeout(() => {
			document.querySelectorAll("#quiz-stats>div>span")
				.forEach(el => el.classList.remove("fadeIn"));
		}, 375);
	}, 375);
}

function myFunction() {

	const title = document.getElementById("TextField")
		.value;
	const count = stats.averageResponseTime;
	async function create(data) {
		const resp = await fetch('/~/dist/open/leaderboard3', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		})
		const ans = await resp.json();

	}
	create({ title, count });
	document.getElementById("Save")
		.style.display = "none";

}

// Auxilliary Rounding Function
function round(value, decimals) {
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
} // Note: decimals>=0, Example: round(1.005, 2); -> 1.01
"use strict";

//Helper and common functions
(function (BFG) {
	BFG.extend = function (obj) {
		var key,
			args = Array.prototype.slice.call(arguments, 1);
		args.forEach(function (value, index, array) {
			for (key in value) {
				if (value.hasOwnProperty(key)) {
					obj[key] = value[key];
				}
			}
		});
		return obj;
	};

	BFG.rnd = function (min, max) { //random on steriods
		if (min instanceof Array) { //returns random array item
			if (min.length === 0) {
				return undefined;
			}
			if (min.length === 1) {
				return min[0];
			}
			return min[rnd(0, min.length - 1)];
		}
		if (typeof min === "object") { // returns random object member
			min = Object.keys(min);
			return min[rnd(min.length - 1)];
		}
		min = min === undefined ? 100 : min;
		if (!max) {
			max = min;
			min = 0;
		}
		return Math.floor(Math.random() * (max - min + 1) + min);
	};

	BFG.ArrayIndexOf = function (array, value, fn) { //I did not want to override the Array.prototype.indexOf
		var result = -1;
		array.forEach(function (v, i, a) {
			result = fn(value, v) ? i : result;
		});
		return result;
	};
	window.BFG = BFG;
})(window.BFG || {});

//Erik Möller - polyfill for requestAnimationFrame
(function () {

	var lastTime = 0;
	var vendors = ['webkit', 'moz'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame =
			window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function (callback, element) {
			var currTime = new Date()
				.getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function () { callback(currTime + timeToCall); },
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
}());

Object.keys = Object.keys || function (o) {
	if (o !== Object(o))
		throw new TypeError('Object.keys called on a non-object');
	var k = [],
		p;
	for (p in o)
		if (Object.prototype.hasOwnProperty.call(o, p)) k.push(p);
	return k;
};

window.assert = window.assert || function (value, message) {
	if (!message) {
		message = value;
		value = true;
	}
	var ul = document.getElementById('assert');
	if (!ul) {
		ul = document.createElement('ul');
		ul.id = 'assert';
		document.body.appendChild(ul);
	}
	var li = document.createElement('li');
	li.className = value ? 'success' : 'fail';
	li.appendChild(document.createTextNode(message));
	ul.appendChild(li);
};

Array.prototype.forEach = Array.prototype.forEach || function (callback, context) {
	for (var i = 0, len = this.length; i < len; i++) {
		callback.call(context || null, this[i], i, this);
	}
};

Array.prototype.difference = Array.prototype.difference || function (ar, fn) {
	var isInArray, result = [];
	fn = fn || function (a, b) {
		return a === b;
	};
	for (var i = 0, len = this.length; i < len; i++) {
		isInArray = false;
		for (var x = 0, lenx = ar.length; x < lenx; x++) {
			if (fn(this[i], ar[x])) {
				isInArray = true;
				break;
			}
		}
		if (!isInArray) {
			result.push(this[i]);
		}
	}
	return result;
};

//Leaderboard
(function (BFG) {
	var Leaderboard = function (o) {
		this.config = BFG.extend({
			max: 10,
			interval: 10,
			elemId: 'leaderboard',
			sort: 'sort',
			margin: 0,
			transitionClass: 'move',
			display: function (data) {
				return data.toString();
			},
			
			dataCallback: function () { return []; }
		}, o);
		this.data = [];
		this.uiList = [];
		this.ul = document.createElement("ul");
	};
	Leaderboard.prototype = {
		constructor: Leaderboard,
		start: function () {
			var that = this,
				tStart = 0,
				progress = 0,
				interval = that.config.interval * stats.time;
				

			(function run(timestamp) { //This should be moved into it's own .. passing in something like {startTime:0,interval:1000,callback:fn,endOnly:true}
				progress = timestamp - tStart;
				if (progress > interval || progress === 0) {
					
					tStart = timestamp;
					that.getData();
					that.doTransition();
					
					
				}
				
				requestAnimationFrame(run);
			})(0);
			
		},
		stop: function () {
			//This no worky
			console.log(this.animationRequestId);
			cancelAnimationFrame(0);
		},
		getData: function () {
			var that = this;
			this.data = this.config.dataCallback();
			this.data.sort(function (a, b) {
				return b[that.config.sort] - a[that.config.sort];
			});
			this.data = this.config.max > this.data.length ? this.data : this.data.slice(0, this.config.max);
			//do something about the uiList when it's shorter than max
			if (this.data.length !== this.uiList.length) {
				this.buildUI();
			}
			return this;
		},
		buildUI: function () {
			
			var elem = this.elem || document.getElementById(this.config.elemId) || document.body.appendChild(document.createElement("div"));
			elem.innerHTML = this.ul.innerHTML = ""; // Is there a better way?
			elem.appendChild(this.ul);
			for (var i = 0; i < this.config.max; i++) {
				this.uiList.push({
					elem: this.ul.appendChild(document.createElement("li")),
					id: null,
					content: '',
					sort: 0
				});
				// this.uiList[i].elem.addEventListener('webkitTransitionEnd',function(){
				// 	this.className = "";
				// }); // I can not get this to fire on all elements as some of them do not move.. therefore do not trigger
				this.uiList[i].elem.style.top = "0px";
				this.uiList[i].elem.innerHTML = "Loading...";
			}
			return this;
		},
		doTransition: function () {
			
			var oldElem = [],
				heights = [],
				replaceElem = [],
				that = this;

			replaceElem = this.data.difference(this.uiList, function (a, b) {
				return a.id === b.id;
			});
			this.uiList.forEach(function (v, i, a) {
				var uiIndex, nextAvailable;

/*
				uiIndex = BFG.ArrayIndexOf(that.data, v.id, function (a, b) {
					return a === b.id;
				});
				*/

				if (uiIndex >= 0) {
					v.elem.classList.add("move");
					v.sort = that.data[uiIndex][that.config.sort];
					that.display(v.elem, that.data[uiIndex]);
				} else {
					v.elem.classList.add("replace");
					nextAvailable = replaceElem.shift();
					//v.id = nextAvailable.id;
					that.display(v.elem, nextAvailable);
					v.sort = nextAvailable[that.config.sort];
				}
			});
			this.uiList.sort(function (a, b) {
				return b.sort - a.sort;
			});
			this.uiList.forEach(function (v, i, a) {
				
				heights.push(i > 0 ? that.uiList[i - 1].elem.offsetHeight + heights[i - 1] + that.config.margin : 0);
				v.elem.style.top = heights[i] + "px";
				setTimeout(function () { // terrible hack.. my attempted transistionEnd event does not fire on all elements
					v.elem.className = "";
				}, 2000);
			});
			this.ul.style.height = (heights[heights.length - 1] + this.uiList[this.uiList.length - 1].elem.offsetHeight + that.config.margin) + "px";
			return this;
		},
		display: function (elem, data) {
			var display = this.config.display(data);
			elem.innerHTML = ""; // Is this the best way to empty?
			if (typeof display === "object") {
				elem.appendChild(display);
			} else if (typeof display === "string") {
				elem.innerHTML = display;
			}
		}
	};

	BFG.Leaderboard = Leaderboard;
	window.BFG = BFG;
})(window.BFG || {});

var test = new BFG.Leaderboard({
	
	interval: 5,
	max: 10,
	margin: 5,
	display: function (item) {
		
		var content = document.createElement('div'),
			a = content.appendChild(document.createElement('a')),
			span = document.createElement('span');
		a.innerHTML = item.title;
		a.href = "#";
		span.innerHTML = item.count;
		a.appendChild(span);
		return content;
	},
	sort: 'count',
	dataCallback: function () {
			
		data = []
		async function test() {

			const resp = await fetch('/~/dist/open/leaderboard3?all=true', {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			})
			const ans = await resp.json();
			const datas = []
			for (var s = 0; s < ans.length; s++) {
				datas.push(ans[s].data);
			}
			stats.lead = datas;
			
			
			

		}

	test();
	if(stats.lead.length < 10){
		document.getElementById("leaderboard").style.display = "none";
	
	return [ //simulates incoming data
		{title: "Loading...", count: 0 },
		{title: "Loading...", count: 0 },
		{title: "Loading...", count: 0 },
		{title: "Loading...", count: 0 },
		{title: "Loading...", count:0},
		{title: "Loading...", count:0 },
		{title: "Loading...", count: 0},
		{title: "Loading...", count: 0 },
		{title: "Loading...", count: 0 },
		{title: "Loading...", count: 0 }

		];
	} else {
		document.getElementById("leaderboard").style.display = "block";
	
		return stats.lead;
		
	}
}
});
test.start();