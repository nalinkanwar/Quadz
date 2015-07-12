/* our 'classes' */
var Cell = function() {
	this.pos_start = new vector(0,0);
	this.pos_end = new vector(0,0);
 	this.filled = false;
	this.destroyable = false;
	this.colour = "transparent";
}

var vector = function(x,y) {
	this.x = x;
	this.y = y;
}

var sq_type = {
	NORMAL_SQUARE: 0,
	DIAGONAL_SQUARE: 1,
	SKEWED_SQUARE: 2
}

/* Basically tile_list is used to get accurate positions of the blocks
   while the map will actually be used to detect mouse clicks and squares */
var tile_list = [];
var map = [];

var gameState = 0;

/* Just some fixed global values set on init*/
var tile_x = 30;
var tile_y = 30;
var xoffset = 20;
var yoffset = 20;
var n_xtiles;
var n_ytiles;

var score = 0, level = 1, max_lvl_colours = 2;
var levelFactor = 2.50; /* 150% increase in required score to gain next level*/
var levelReq = 500, prevLevelReq = 0;
var lx,ly;

var LW = 5; //Line Thickness

var ScrambleGrad = 100; /*gradient value for our button */
var canvas, scorecanvas, ctx, scorectx;
var blockColours /*= ["rgb(200,0,0)", "rgb(0,200,0)", "rgb(0,0,200)", "rgb(200,200,0)"]*/;
var blockCount, maxBlockCount;
var MAXCOLOURS /*= blockColours.length*/;

/* input handling */
var keys = [];
var MouseX, MouseY, MouseClicks = 0, MousePos = [];
var SMouseX, SMouseY;

/* sound effects and music*/
var chime, explode, music, scramble, no, levelup;
var mute = false, mute_col = "#ffffff";



var shalinTime = 151;

/* OnLoad function */
function load_game() {
	//setTimeout(checkForEnd,gameTime);
	setTimeout(updateTime(),1000);

	document.onkeydown=function(){
		/* disable vertical scrolling from arrows :) */
		if(event.keyCode == 38 || event.keyCode == 40) {
			return false;
		}
		if(event.keyCode == 27) { /* Escape key */
			bgmusic.pause();
			back();
		}
		return true;
	}

	/* Create the world, fetch the canvas, init game screen */
	canvas = document.getElementById('game');
	ctx = canvas.getContext('2d');
	scorecanvas = document.getElementById('scoreboard');
	scorectx = scorecanvas.getContext('2d');

	var canvasPosition = getElementPosition(canvas);
	var scorePosition = getElementPosition(scorecanvas);

	console.log("Canvas Width: " + canvas.width + " Canvas Height: " + canvas.height);

	generatePalettes();
	createWorld();

	/* setup our scoreboard canvas */
	scorectx.font = "30px manteka";

	/* register key handlers */
	//document.addEventListener('keydown',handleKeyDown,true);
	//document.addEventListener('keyup',handleKeyUp,true);

	//mouse handling
	canvas.addEventListener("mousemove", function (e) {
		MouseX = (e.clientX - canvasPosition.x);
		MouseY = (e.clientY - canvasPosition.y);
		//console.log("Mouse x: " + MouseX + " Mouse y: " + MouseY);
	}, true);
	canvas.addEventListener("click", handleMouseClick, true);

	scoreboard.addEventListener("mousemove", function (e) {
		SMouseX = (e.clientX - scorePosition.x);
		SMouseY = (e.clientY - scorePosition.y);
		//console.log("SMouse x: " + SMouseX + " SMouse y: " + SMouseY);
	}, true);
	scoreboard.addEventListener("click", handleScoreClick, true);

	/* This disables right click context menu on our canvas */
	var myElement;
	myElement = document.querySelector('#game');
	myElement.addEventListener('contextmenu', blockContextMenu);

	/*Sounds*/
	var audioType = 'audio/mpeg';
	var audioExt = '.mp3';

	chime = document.createElement('audio');
	if (chime.canPlayType('audio/mpeg;') == false) {
		audioType= 'audio/ogg';
		audioExt = '.ogg';
	}
	explode = document.createElement('audio');
	scramble = document.createElement('audio');
	no = document.createElement('audio');
	levelup = document.createElement('audio');
	bgmusic = document.createElement('audio');

	bgmusic.src = 'sfx/bgmusic' + audioExt;
	bgmusic.addEventListener('ended', function() {
		this.currentTime = 0;
		this.play();
	}, false);
	bgmusic.volume = 0.5;
	bgmusic.play();

	chime.volume = 0.7;
	explode.volume = 0.5;
	scramble.volume = 0.5;
	no.volume = 0.7;
	levelup.volume = 0.5;


	chime.src= 'sfx/chime2' +  audioExt;
	explode.src = 'sfx/explode' + audioExt;
	scramble.src = 'sfx/scramble' + audioExt;
	no.src = 'sfx/no' + audioExt;
	levelup.src = 'sfx/levelup' + audioExt;

	requestAnimFrame(handleEvents); //much smoother than setInterval
};

//updating display time
function updateTime()
{

	if (shalinTime > 0)
	{
		shalinTime = shalinTime - 1;
	}
	else
	{
		lx = 50;
		ly = 300;
		gameState = 2;
	}
	setTimeout(updateTime,1000);

}
function resetWorld() {

	tile_list = [];
	//shalinTime=61;

	gameState = 0;
	score = 0, level = 1, max_lvl_colours = 2;
	levelFactor = 2.50; /* 150% increase in required score to gain next level*/
	levelReq = 500;
	prevLevelReq = 0;

	MouseClicks = 0;
	MousePos = [];

	initWorld();
}

function LevelUP() {

	gameState = 1;
	lx = 50;
	ly = yoffset;

	tile_list = [];

	MouseClicks = 0;
	MousePos = [];

	initWorld();

	if(mute == false) {
		levelup.play();
	}
}

var blockContextMenu = function (evt) {
	evt.which = 2;
	handleMouseClick(evt);
	evt.preventDefault();
};


window.requestAnimFrame = (function()
{
   return  window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           window.oRequestAnimationFrame      ||
           window.msRequestAnimationFrame     ||
           function(handleEvents)
           {
				/*everything failed :( so back to old method */
               window.setTimeout(handleEvents, 1000 / 60);
           };
})();

function createWorld() {

	console.log("creating World");

	n_xtiles = Math.floor((canvas.width - (2 * xoffset))/tile_x);
	n_ytiles = Math.floor((canvas.height - (2 * yoffset))/tile_y);

	console.log("n_xtiles: " + n_xtiles + " n_ytiles: " + n_ytiles);
	map = new Array(n_xtiles);
	for(var x = 0; x < n_xtiles; x++){
		map[x] = new Array(n_ytiles);
		for(var y = 0; y < n_ytiles; y++){
			map[x][y] = new Cell();

			map[x][y].pos_start = new vector((x * tile_x) + xoffset, (y * tile_y) + yoffset);
			map[x][y].pos_end = new vector(((x + 1) * tile_x)-1 + xoffset, ((y + 1) * tile_y)-1 + yoffset);
		}
	}
	initWorld();
}

function copyCells(src, dest) {
	dest.pos_start.x = src.pos_start.x;
	dest.pos_start.y = src.pos_start.y;
	dest.pos_end.x = src.pos_end.x;
	dest.pos_end.y = src.pos_end.y;

 	dest.filled = src.filled;
	dest.destroyable = src.destroyable;
	dest.colour = src.colour;
}

function initWorld() {

	console.log("initing World");

	/* set block colours*/
	var n = 5;
	blockColours = new Array(n);
	blockCount = new Array(n);
	maxBlockCount = Math.floor((n_xtiles * n_ytiles)/n);

	blockColours[0] = "#FCC220";
	blockColours[1] = "#346EA8";
	blockColours[2] = "#BF4B31";
	blockColours[3] = "#168830";
	blockColours[4] = "#612361";

	blockCount[0] = 0;
	blockCount[1] = 0;
	blockCount[2] = 0;
	blockCount[3] = 0;
	blockCount[4] = 0;

	/*for(var x = 0; x < n; x++) {
		var r = Math.floor(Math.random() * 360);
		var g = Math.floor(Math.random() * 360);
		var b = Math.floor(Math.random() * 360);
		blockColours[x] = "rgb(" + r + "," + g + "," + b + ")";
	}*/
	ctx.lineWidth = LW;
	var random;
	for(var x = 0; x < n_xtiles; x++){
			var temp = new Cell();
			random = getBlockColour();
			copyCells(map[x][0], temp);
			temp.colour= blockColours[random];
			blockCount[random]++;
			tile_list.push(temp);
	}
	printBC();

	MAXCOLOURS = blockColours.length;
}

/* This will generate new blocks in empty spaces */
function generateBlocks() {
	var generated = false;
	for(var x = 0; x < n_xtiles; x++) {
		var blocked = false;

		var tx = (x * tile_x) + xoffset;
		for(var i = 0; i < tile_list.length; i++) {
			if(tile_list[i].pos_start.x == tx) {
				if((tile_list[i].pos_start.y >= yoffset) &&
					(tile_list[i].pos_start.y < (tile_y + yoffset))) {
					blocked = true;
					break;
				}
			}
		}
		var random;
		if(blocked == false) {
			var temp = new Cell();
			random = getBlockColour();
			copyCells(map[x][0], temp);
			temp.colour= blockColours[random];
			blockCount[random]++;
			map[x][0].filled = true;
			tile_list.push(temp);
			generated = true;
		}
	}
	if(generated == true) {
		printBC();
	}
}

/* apply our own custom gravity for simplicity */
function applyGravity() {

	/* Here, we iterate through our tiles list to make them
		'fall' pixel by pixel if there's nothing under it */
	var gravity = 10;
	var bottom_limit = (canvas.height - yoffset - 1);

	for(var i = 0; i < tile_list.length; i++) {
		var x = tile_list[i].pos_start.x;
		var y = tile_list[i].pos_end.y;
		var y_s = tile_list[i].pos_start.y;

		if(tile_list[i].pos_end.y < bottom_limit) {
			var collided = false;

			tile_list[i].pos_start.y += gravity;
			tile_list[i].pos_end.y += gravity;

			/* Brute force collision detection :< */
			for(var j = 0; j < tile_list.length; j++) {
				/* first check if it is in same column */
				if(tile_list[i].pos_start.x == tile_list[j].pos_start.x) {
					if (tile_list[i].pos_end.y == tile_list[j].pos_start.y) {
						collided = true;
						break;
					}
					if ((tile_list[i].pos_end.y > tile_list[j].pos_start.y)
						&& (tile_list[i].pos_end.y < tile_list[j].pos_end.y)) {
						collided = true;
						break;
					}
				}
			}
			/* we're standing on some other block.. rollback*/
			if(collided == true) {
				tile_list[i].pos_start.y -= gravity;
				tile_list[i].pos_end.y -= gravity;
				continue;
			}

			if(tile_list[i].pos_end.y > bottom_limit) {
				tile_list[i].pos_end.y = bottom_limit - 1;
				tile_list[i].pos_start.y = bottom_limit - tile_y - 1;
			}

			/* Map spot checks */
			var mx = Math.floor(x/tile_x), my = Math.floor(y_s/tile_y);
			/* old y was a map spot, reset it, since it no longer is so */
			if((y_s - yoffset) % tile_y == 0) {
				if(map[mx][my].filled == true) {
					map[mx][my].filled = false;
				}
			}

			/* check if we arrived at a map spot,
			   and register that spot as taken if we did

			   x will always point to a map spot
			   since we never move horizontally,
			   so just check for y
			*/
			if((tile_list[i].pos_start.y - yoffset) % tile_y == 0) {
				var newy = Math.floor((tile_list[i].pos_start.y - yoffset)/tile_y);
				/* this spot was already mapped, that means it isn't now,
					so reset old map coords */

				if(map[mx][newy].pos_start.y == tile_list[i].pos_start.y){
					map[mx][newy].filled = true;
					map[mx][newy].destroyable = true;
					map[mx][newy].colour = "#990000";
				}
			}
		}
	}
}

function debugMap() {

	var oldFS = ctx.fillStyle;
	for(var x = 0; x < n_xtiles; x++) {
		for(var y = 0; y < n_ytiles; y++) {
			if(map[x][y].filled == true) {
				ctx.fillStyle = "blue";
			} else {
				ctx.fillStyle = "white";
			}
			ctx.fillRect(map[x][y].pos_start.x, map[x][y].pos_start.y, 1, 1);
			ctx.fillText("+", map[x][y].pos_start.x, map[x][y].pos_start.y);
		}
	}
	ctx.fillStyle = oldFS;
}

/* Our Main Loop function */
function handleEvents() {
	requestAnimFrame(handleEvents);

	//var frameStart = Date.now(), frameEnd;
	clearCanvas();

	/* Render */
	//drawBGPlasma();
	drawWorld();
	ctx.fillStyle = "#218559";
	ctx.fillRect(xoffset - (LW - 2), yoffset - (LW - 2), canvas.width - (2 * xoffset) + LW, tile_y);
	drawScore();

	switch(gameState) {
		case 0:
			/* Logic */
			applyGravity();
			generateBlocks();
		break;
		case 1:
			/*ctx.fillStyle = "#218559";
			ctx.fillRect(0, 0, canvas.width, canvas.height);*/

			drawLvlUPPlasma();
			
			ctx.font =  "100px manteka";
			ctx.fillStyle = "#EBB035";
			ctx.fillText("Level Up!", lx, ly);

			ctx.strokeStyle = "#000000";
			ctx.strokeText("Level Up!", lx, ly);

			ctx.font =  "12px manteka";
			ctx.fillText("click to continue",  lx + 30, ly + 20);

			if(ly < 320) {
				ly += 10;
			}
		break;
		case 2:
			drawLvlUPPlasma();
			ctx.font =  "100px manteka";
			ctx.fillStyle = "#EBB035";
			ctx.fillText("GameOver!", lx, ly);

			ctx.strokeStyle = "#000000";
			ctx.strokeText("GameOver!", lx, ly);

			ctx.font =  "12px manteka";
			ctx.fillText("Your score was:" +score , lx + 30, ly + 20);
			//ctx.fillText("click to continue",  lx + 40, ly + 30);
			
			
			break;

	}

	/* Debug */
	//debugMap();
	/* frameEnd = Date.now();
	ctx.fillStyle = "black";
	ctx.fillText("FPS: " + Math.round(1000 / (frameEnd - frameStart)) + " NumTiles: " + tile_list.length, 10, 10); */
}

var distCell = function distCell(c1, c2) {
	return(dist(c1.x, c1.y, c2.x, c2.y));
}

function handleScores(type, factor) {

	console.log(" Type " + type + " factor " + factor + " level " + level);
	switch(type) {
		case sq_type.NORMAL_SQUARE:
			//score += (50 * factor * level);
			score += 50;
		break;
		case sq_type.DIAGONAL_SQUARE:
			//score += (100 * factor * level);
			score += 100;
		break;
		case sq_type.SKEWED_SQUARE:
			//score += (150 * factor * level);
			score += 150;
		break;
	}

	if(score >= levelReq) {
		level++;
		shalinTime = shalinTime + 100;
		prevLevelReq = levelReq;
		levelReq = Math.floor(levelReq + (levelReq * levelFactor));

		/* increment number of types of blocks every 3 levels */
		if(level % 3 == 0) {
			if(max_lvl_colours < blockColours.length) {
				max_lvl_colours++;
			}
		}

		LevelUP();
	}

	score = Math.floor(score);
}

/* This is our square handling logic function */
function detectSquares(i) {
	var success = false;
	if(MouseClicks == 5 && MousePos.length == 5) {		
		var dists = [];
		var i;
		
		if( (MousePos[0].pos_start.x == MousePos[4].pos_start.x) &&  
			(MousePos[0].pos_start.y == MousePos[4].pos_start.y) ) {
			success = true;
		}
		
		if(success == true) {
			for(i = 0; i < 4; i++) {
				/* Colour must be same too! */
				if(MousePos[i].colour != MousePos[i+1].colour) {
					success = false;
					break;
				}
				dists.push(distCell(MousePos[i].pos_start, MousePos[i+1].pos_start));
				//console.log("dists: " + dists[i]);	
			}
		}
		if(success == true) {
			for(i = 0; i < (dists.length - 1); i++) {
				if(dists[i] != dists[i+1]) {
					success = false;
					//console.log("SQUARE CHECK FAIL");
					break;
				}
			}
		}
		
		if(success == true) {
			//console.log("SQUARE CHECK SUCCCESS");	
			/* we need to remove those tiles */			
			
			/* Normal square */
			if( ((MousePos[0].pos_start.x == MousePos[3].pos_start.x) && 
				(MousePos[0].pos_start.y == MousePos[1].pos_start.y)) || 
				((MousePos[0].pos_start.x == MousePos[1].pos_start.x) && 
				(MousePos[0].pos_start.y == MousePos[3].pos_start.y)) ) {
									
				handleScores(sq_type.NORMAL_SQUARE, (dists[0]/tile_y));
			} else {
				/* Diagonal square */
				if( ((MousePos[0].pos_start.y == MousePos[2].pos_start.y) &&
					 (MousePos[1].pos_start.x == MousePos[3].pos_start.x)) ||
					 ((MousePos[1].pos_start.y == MousePos[3].pos_start.y) &&
					 (MousePos[0].pos_start.x == MousePos[2].pos_start.x)) ){
					handleScores(sq_type.DIAGONAL_SQUARE, (dists[0]/tile_y));
				} else {
					/* skewed square */
					handleScores(sq_type.SKEWED_SQUARE, (dists[0]/tile_y));
				}			
			}
			
			for(i = 0; i < 5; i++) {
				var idx = tile_list.indexOf(MousePos[i]);
				
				if(idx != -1) {					
					//console.log("Tile List Colour " + tile_list[idx].colour);
					var cidx = blockColours.indexOf(tile_list[idx].colour);
					
					if(cidx != -1) {
						blockCount[cidx]--;						
					}
					tile_list.splice(idx, 1);
				}
			}
			printBC();
		}		
	}
	if(mute == false) {
		if(MouseClicks > 0) {
			if(success == false) {
				no.play();	
			} else {
				explode.play();					
			}
		}
	}
	/* Reset Mouse thingies */
	MousePos = [];
	MouseClicks = 0;
}

/* Input handling routines */
function handleKeyDown(evt){
	keys[evt.keyCode] = true;
}
function handleKeyUp(evt){
	keys[evt.keyCode] = false;
}

function printBC() {
/*
	for(var c = 0; c < 5; c++) {
		console.log(" blockCount " + c + " : " + blockCount[c]);
	}
*/
}

function getBlockColour() {
	var random;
	random = Math.floor(Math.random()* max_lvl_colours);
	if(blockCount[random] >= maxBlockCount) {
		/* try to get an emptier colour slot */
		random = Math.floor(Math.random()* max_lvl_colours);
	}
	return random;
}

function doScramble() {

	if(score > 50) {
		for(var c = 0; c < 5; c++) {
			blockCount[c] = 0;
		}
		if(mute == false) {
			scramble.play();
		}
		score -= 50;

		var random;
		for(var i = 0; i < tile_list.length; i++) {
			random = getBlockColour();
			tile_list[i].colour = blockColours[random];
			blockCount[random++];
		}
		printBC();
	} else {
		no.play();
	}
}

function handleScoreClick(evt) {

	//console.log("CLICK: SMouse x: " + SMouseX + " SMouse y: " + SMouseY + " which " + evt.which );
	switch(evt.which) {
		case 1:
			/*scramble button*/
			if( ((SMouseX > 24) && (SMouseX < 250)) &&
				(SMouseY > 399) &&(SMouseY < 550)) {
				doScramble();
			}
						/*Bottom row buttons*/
			if( (SMouseY > (600 - 12)) && (SMouseY < 600)) {

				if((SMouseX > 10) && (SMouseX < 10 + scorectx.measureText("Mute").width)) {
					if(mute == true) {
						bgmusic.volume = 0.5;
						mute_col = "#ffffff";
						mute = false;
					} else {
						bgmusic.volume = 0.0;
						mute_col = "#00ff00";
						mute = true;
					}
				} else {
					if((SMouseX > 10 + scorectx.measureText("Mute").width) &&
						(SMouseX < 10 + scorectx.measureText("Mute Reset").width)){
						//GAME RESET;
						resetWorld();
					}
				}
			}

		break;

	}
}

function handleMouseClick(evt) {
	//console.log("handleMouseCLick :" + evt.which);
	if(gameState == 1) {
		gameState = 0;
		return;
	}

	switch(evt.which) {
		case 1:
			if( ((MouseX < (canvas.width - xoffset))
				 && (MouseX > xoffset)) &&
				((MouseY < (canvas.height - yoffset))
				 && (MouseY > yoffset)) ) {
				/*Click was in game area*/

				var map_mx = Math.floor((MouseX - xoffset)/tile_x);
				var map_my = Math.floor((MouseY - yoffset)/tile_y);

				if(map_my == 0 ) {
					break;
				}
				if(map[map_mx][map_my].filled == true) {

					var mx = map[map_mx][map_my].pos_start.x;
					var my = map[map_mx][map_my].pos_start.y;

					/* also delete from tile_list */
					for(var i = 0; i < tile_list.length; i++) {
						if((tile_list[i].pos_start.x == mx) &&
							(tile_list[i].pos_start.y == my)) {
								if(MouseClicks < 5) {
									if(mute == false) {
										chime.play();
									}
									var ctr = 0;
									if((MouseClicks == 4) &&
										(MousePos[0].pos_start.x == mx) &&
											(MousePos[0].pos_start.y == my)) {

											ctr = MousePos.length;
											/* Special case */
									} else {
										for(ctr = 0; ctr < MousePos.length; ctr++) {
											if((MousePos[ctr].pos_start.x == mx) &&
												(MousePos[ctr].pos_start.y == my)) {
												/* already selected */
												break;
											}
										}
									}
									if(ctr == MousePos.length) {
										/* Not a selected tile, add it */
										MouseClicks++;
										MousePos.push(tile_list[i]);
										//console.log("Selected Tile: x " + tile_list[i].pos_start.x + " y " + tile_list[i].pos_start.y);
									} else {
										/* Deselect if last selected tile */
										if(ctr == MousePos.length - 1) {
											MouseClicks--;
											MousePos.splice(ctr, 1);
										}
									}
								} else {
									if(MouseClicks == 5){
										if((MousePos[4].pos_start.x == mx) &&
											(MousePos[4].pos_start.y == my)) {
											/* already selected */
											MousePos.pop();
											MouseClicks--;
										}
									}

								}
								//console.log(" Selected Tile: (" + mx + "," + my + ")");
								//console.log(" Mouseclicks: " + MouseClicks + " MousePos length: " + MousePos.length);*/
								break;
						}
					}
					//map[map_mx][map_my].filled = false;
				}
			}
		break;
		case 2:
			/*center click..*/
		break;
		case 3:
			detectSquares();
			/* right click*/
		break;
	}
}

/* simple collision detection */
function valueInRange(val, min, max) {
	return((val >= min) && (val <= max));
}

function checkCollision(v1, v1s, v2, v2s)  {
	return( (valueInRange(v1.x - v1s, v2.x - v2s, v2.x + v2s) ||
		     valueInRange(v2.x - v2s, v1.x - v1s, v1.x + v1s)) &&
			(valueInRange(v1.y - v1s, v2.y - v2s, v2.y + v2s) ||
		     valueInRange(v2.y - v2s, v1.y - v1s, v1.y + v1s)) );
}

function compareBoxes(box1, box2) {
	return( (box1.x == box2.x) && (box1.y == box2.y));
}

