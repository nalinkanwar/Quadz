/* redefined for our ease */
var RAD = Math.PI/180.0;
var Sin = Math.sin;
var Cos = Math.cos;
var Sqrt = Math.sqrt;

function clearCanvas() {
	canvas = document.getElementById('game');
	ctx = canvas.getContext('2d'); 
	
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.restore();
}

/*draw our squares */ 
function drawBox(context, pos1, pos2, colour) {
	context.strokeStyle = '#000000';
	context.fillStyle = colour;
	context.fillRect(pos1.x, pos1.y, (pos2.x - pos1.x), (pos2.y - pos1.y));
	context.strokeRect(pos1.x, pos1.y, (pos2.x - pos1.x), (pos2.y - pos1.y));
	
	/*ctx.fillText("(" + (pos1.x) + ","+ (pos1.y) + ")", 
			(pos1.x), (pos1.y));*/	
}

/* this stores our palettes for the plasma */
var palette = [];

var shiftpalette = 0;

/* Plasma palette generation :)*/
function generatePalettes() {
	// generate some palettes
	function rgb(r,g,b)
	{
	 return "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")";
	}
	
	palettes = [];	
	var palette = [];
	
	palette = new Array(256);
	for (var i = 0; i < 64; i++)
	{
		var fader = 2;
		palette[i] = rgb(i << fader,255 - ((i << fader) + 1),64);
		palette[i+64] = rgb(255,(i << fader) + 1,128);
		palette[i+128] = rgb(255 - ((i << fader) + 1),255 - ((i << fader) + 1),192);
		palette[i+192] = rgb(0,(i << fader) + 1,255);
	}
	this.palettes.push(palette);

	return this;
};

var dist = function dist(a, b, c, d)
{
	/* basic distance between two points trig formula */
	return Sqrt((a - c) * (a - c) + (b - d) * (b - d));
}

var colourFunction = function colourFunction(x, y)
{
	//Time is our basic randomizer! 
	var time = Date.now()/512;
	return ((Sin(dist(x + time, y, 128.0, 128.0) / 8.0)
			+ Sin(dist(x - time, y, 64.0, 64.0) / 8.0)
			+ Sin(dist(x, y + time / 7, 192.0, 64) / 7.0)
			+ Sin(dist(x, y, 192.0, 100.0) / 8.0)) + 4) * 32;
}

function drawLvlUPPlasma() {
	var oldFS = ctx.fillStyle;	
	var palette = palettes[0];

	shiftpalette++;
	var xinc = canvas.width/10, yinc = canvas.height/64;
	for (var y = 0; y <= (canvas.height)/yinc; y++)
	{
		for (var x = 0; x <= (canvas.width)/xinc; x++)
		{			
			ctx.fillStyle = palette[(~~colourFunction(x, y) + shiftpalette) % 256];
			ctx.fillRect(x * xinc, y * yinc, xinc, yinc); 			
		}
	}
		
	var sxinc = scorecanvas.width/2, syinc = scorecanvas.height/32;
	for (var y = 0; y <= (scorecanvas.height)/syinc; y++)
	{
		for (var x = 0; x <= (scorecanvas.width)/sxinc; x++)
		{			
			scorectx.fillStyle = palette[(~~colourFunction(x, y) + shiftpalette) % 256];
			scorectx.fillRect(x * sxinc, y * syinc, sxinc, syinc); 			
		}
	}	
	ctx.fillStyle = oldFS;
}
   
function drawBGPlasma() {
	var xinc = 10, yinc = 64;
	var oldFS = ctx.fillStyle;	
	var palette = palettes[0];
	/* pixelly plasma but we dont want to hit cpu too hard..*/	
	shiftpalette++;
	for (var y = 0; y <= (canvas.height/yinc); y++)
	{
		for (var x = 0; x < (xoffset/xinc); x++)
		{			
			ctx.fillStyle = palette[(~~colourFunction(x, y) + shiftpalette) % 256];
			ctx.fillRect((x * xinc), (y * yinc), xinc, yinc); 			
		}
	}	
	for (var y = 0; y < (yoffset/yinc); y++)
	{
		for (var x = 0; x <= (canvas.width/xinc); x++)
		{			
			ctx.fillStyle = palette[(~~colourFunction(x, y) + shiftpalette) % 256];
			ctx.fillRect((x * xinc), (y * yinc), xinc, yinc); 			
		}
	}	
	for (var y = 0; y <= (canvas.height/yinc); y++)
	{
		for (var x = (canvas.width - xoffset)/xinc; x <= (canvas.width/xinc); x++)
		{			
			ctx.fillStyle = palette[(~~colourFunction(x, y) + shiftpalette) % 256];
			ctx.fillRect((x * xinc), (y * yinc), xinc, yinc); 		
		}
	}	
	for (var y = (canvas.height - yoffset)/yinc; y <= (canvas.height/yinc); y++)
	{
		for (var x = 0; x <= (canvas.width/xinc); x++)
		{			
			ctx.fillStyle = palette[(~~colourFunction(x, y) + shiftpalette) % 256];
			ctx.fillRect((x * xinc), (y * yinc), xinc, yinc); 			
		}
	}

	var sxinc = scorecanvas.width/2, syinc = scorecanvas.height/32;
	for (var y = 0; y <= (scorecanvas.height)/syinc; y++)
	{
		for (var x = 0; x <= (scorecanvas.width)/sxinc; x++)
		{			
			scorectx.fillStyle = palette[(~~colourFunction(x, y) + shiftpalette) % 256];
			scorectx.fillRect(x * sxinc, y * syinc, sxinc, syinc); 			
		}
	}
	
	ctx.fillStyle = oldFS;
}

function drawScore() {
	var oldFS = ctx.fillStyle;	

	/* clear canvas */
	scorectx.clearRect(0,0, scorecanvas.width, scorecanvas.height);
	
	scorectx.shadowOffsetX = 0;
    scorectx.shadowOffsetY = 0;
	
	/* Draw circle before shadowing.. */
	scorectx.beginPath();
	scorectx.arc(100,475,75,0,2*Math.PI);
	
	var grd=ctx.createRadialGradient(100,475,5,100,475,ScrambleGrad);
	grd.addColorStop(0,"#ff0000");
	grd.addColorStop(1,"#330000");

	// Fill with gradient
	scorectx.fillStyle=grd;
	scorectx.fill();
	scorectx.stroke();
	
	/*apply shadowing*/
	scorectx.shadowColor = '#000000';
    scorectx.shadowBlur = 0;
    scorectx.shadowOffsetX = 3;
    scorectx.shadowOffsetY = 3;
	

	scorectx.font = "50px manteka";
	scorectx.fillStyle = "#EBB035";					
	scorectx.fillText("Quadz", 20, 100);
	
	scorectx.font = "20px manteka";
	scorectx.fillStyle = "#D0C6D1";
	scorectx.fillText("Score: " + score, 20, 160);
	scorectx.fillText("Level: " + level, 20, 190);
	scorectx.fillText("Time:" + shalinTime, 20, 220)
	//scorectx.fillText("Next: " + levelReq, 20, 220);
	
	var scorelength = canvas.width - (2 * xoffset);
	var levScore = levelReq - prevLevelReq;
	var playScore = score - prevLevelReq;
	
	var scoreline = Math.floor((((playScore * 100)/levScore) * scorelength)/100);

	ctx.fillStyle = "#005500";
	ctx.fillRect( xoffset, 10, scorelength, 20);
	ctx.fillStyle = "#FFFF00";	
	ctx.fillRect( xoffset, 10, scoreline, 20);
	
	//scorectx.fillRect(50, 250, 100, 100);
	
	scorectx.fillStyle="#EBB035";	
	scorectx.fillText("Scramble!", 50, 485);	
	
	scorectx.font = "12px manteka";
	scorectx.fillStyle = mute_col;	
	scorectx.fillText("Mute", 10, 600);
		
	scorectx.fillStyle = "#ffffff";	
	scorectx.fillText("Reset", 10 + scorectx.measureText("Mute ").width, 600);
	
	ctx.fillStyle = oldFS;
}

function drawWorld() {
	var oldFS = ctx.fillStyle;	
	
	/* This draws our map of tiles*/
	/* Hide first row.. to create illusion of blocks sliding in */	
	for(var i = 0; i < tile_list.length; i++) {
		drawBox(ctx,  tile_list[i].pos_start, tile_list[i].pos_end, tile_list[i].colour);		
	}
	
	var oldLW = ctx.lineWidth;
	/* Draw square lines for selection by user*/
	if(MouseClicks > 0) {
		var ctr;
		for(ctr = 5; ctr >= 0; ctr--) {		
			ctx.beginPath();			
			if(ctr == 0) {
				ctx.lineWidth = 5;
				ctx.strokeStyle = "rgb(255,255,255)";
			} else {					/*#EBB035*/
				ctx.lineWidth = (ctr * 2) + 5;
				ctx.strokeStyle = "rgba(0,180,0,0.2)";
			}
			ctx.moveTo(MousePos[0].pos_start.x + tile_x/2, MousePos[0].pos_start.y + tile_y/2);
			ctx.strokeRect(MousePos[0].pos_start.x, MousePos[0].pos_start.y, tile_x - 1, tile_y - 1);
			for(var i = 1; i < MousePos.length; i++) {		
				ctx.lineTo(MousePos[i].pos_start.x + Math.ceil(tile_x/2), MousePos[i].pos_start.y + Math.ceil(tile_y/2));			
				ctx.strokeRect(MousePos[i].pos_start.x, MousePos[i].pos_start.y, tile_x - 1, tile_y - 1);
			}			
			ctx.stroke();
			ctx.closePath();
		}
	}
	ctx.lineWidth = oldLW;	
	ctx.fillStyle = oldFS;
	
}

