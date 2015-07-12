function reset()
{    
    $("#boxMenu").hide();
    $("#boxHelp").hide();
    $("#boxAbout").hide();    
    $("#boxGame").hide();
}

function go()
{
    reset();
    $("#boxGame").fadeIn(1000);
	requestAnimFrame(handleEvents); //much smoother than setInterval
	load_game();
}

function back()
{
    reset();
    $("#boxMenu").fadeIn(1000);
}

$(function(){
    back();

	$("#btnAbout").click(function(){
        reset();
        $("#boxAbout").fadeIn(1000);
    });

    $("#btnHelp").click(function(){
        reset();
        $("#boxHelp").fadeIn(1000);
    });
	
    $("#btnStart").click(function(){
        
        go();
    });

    $("#btnBack1").click(function(){
        back();
    });

    $("#btnBack2").click(function(){
        back();
    });

    $("#btnBack3").click(function(){
        back();
    });

});
