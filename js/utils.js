 
//http://js-tut.aardon.de/js-tut/tutorial/position.html
function getElementPosition(element) {
	var elem=element, tagname="", x=0, y=0;
   
	while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
		y += elem.offsetTop;
		x += elem.offsetLeft;
		tagname = elem.tagName.toUpperCase();

		if(tagname == "BODY")
			elem=0;

		if(typeof(elem) == "object") {
			if(typeof(elem.offsetParent) == "object")
				elem = elem.offsetParent;
		}
	}

	return {x: x, y: y};
}
