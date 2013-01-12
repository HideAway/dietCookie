/* MPL 2.0 Author : HideAway */ 

var rowNum = 0;

/**************************/
/** Click Event Listener **/
/**************************/
window.addEventListener("click", function(evt){
	if ( evt.target.tagName == 'IMG' && evt.target.getAttribute('src') == 'trash.png' ){ ///* DeleteCookie */
		self.port.emit("delete-Cookie" , evt.target.getAttribute('id'));
		var jqId = evt.target.getAttribute('id');
		jqId=jqId.replace(/\./g, "\\.");
		$("#"+jqId).parents("tr:first").remove();
	} else if ( evt.target.tagName == 'IMG' && evt.target.getAttribute('src') == 'add.png' ){ ///* add WhiteList */
		var pUrl = $("#parent").attr('value');
		var cUrl = $("#child").attr('value');
		if ( pUrl && cUrl ){
			self.port.emit("add-Whitelist" , [pUrl , cUrl]);
		}
	} else if ( evt.target.tagName == 'IMG' && evt.target.getAttribute('src') == 'trash_delete.png' ){ ///* add WhiteList */
		var sonson = JSON.parse(evt.target.getAttribute('id'));
		self.port.emit("delete-WhiteList", sonson );
	} else {
	}
});

/**************************/
/** Cookie List Listener **/
/**************************/
self.port.on("reflesh-Cookie-start" , function(){
	rowNum = 0;
	$(".dietCookie-proposedList").empty();
	$(".dietCookie-proposedList").append("<tr id='title'><td colspan='2'> Cookie List");
});

self.port.on("add-Cookie" , function handleRefleshSnack(cke){
//	console.log("JS::add-Cookie : " + snackList ); ///* DEBUG COMMENT */
	var sCls = rowNum % 2 == 1 ? "ki" : "gu";
	$(".dietCookie-proposedList").append("<tr class='" + sCls +  "'><td id='icon'><a><img src='trash.png' id='" + cke + "' width='16' height='16'></a><td>" + cke + "");
});

self.port.on("no-Cookie" , function handleRefleshSnack(){
});


self.port.on("reflesh-Cookie-end" , function(){
	self.port.emit("panel-resize" , [ $(".dietCookie-proposedList").width() + 20 ,$(".dietCookie-proposedList").height() + 20 ]);
//	console.log("JS: document.body.scrollWidth              : " + document.body.scrollWidth);		///* DEBUG COMMENT */
//	console.log("JS: documentElement.clientWidth/scrollMaxX : " + document.body.clientWidth + ' + ' +  window.scrollMaxX );		///* DEBUG COMMENT */
//	console.log("JS: document.body.scrollHeight              : " + document.body.scrollHeight);		///* DEBUG COMMENT */
//	console.log("JS: documentElement.clientHeight/scrollMaxY : " + document.body.clientHeight + ' + ' +  window.scrollMaxY );		///* DEBUG COMMENT */
});

/**************************/
/** Snack List Listener  **/
/**************************/
self.port.on("reflesh-Snack-start" , function(){
	rowNum = 0;
	$(".dietCookie-proposedList").empty();
	$(".dietCookie-proposedList").append(	"<tr id='title'><td colspan='3'>White List" + 
											"<tr id='subtitle'> "+
											"<td><a><img src='add.png' width='16' height='16'></a>" + 
											"<td><input name='parent' id='parent' type='text' onfocus=\"if (this.value == 'Parent URL') this.value = '';\" onblur=\"if (this.value == '') this.value = 'Parent URL';\" value=\"Parent URL\" >" +
											"<td><input name='child' id='child' type='text' onfocus=\"if (this.value == 'Child URL') this.value = '';\" onblur=\"if (this.value == '') this.value = 'Child URL';\" value=\"Child URL\" ></tr>"
										);

});
self.port.on("add-Snack" , function handleRefleshSnack( [pUrl , cUrl ] ){
//	console.log("JS::add-Snack : " + snackList ); ///* DEBUG COMMENT */
	rowNum++;
	
	var sCls = rowNum % 2 == 1 ? "ki" : "gu";
	
	$("tbody").append(
		$("<tr class='"+sCls +"'>")
	.append(
		$("<td id='icon'>").html("<a><img src='trash_delete.png' id='[\"" + pUrl + "\",\"" + cUrl + "\"]' width='16' height='16'></a>")
	).append(
		$("<td>").html(pUrl)
	).append(
		$("<td>").html(cUrl)
		)
	);
});


self.port.on("no-Snack" , function handleRefleshSnack( ){
});

self.port.on("reflesh-Snack-end" , function(){
	self.port.emit("panel-resize" , [ $(".dietCookie-proposedList").width() + 20 ,$(".dietCookie-proposedList").height() + 20 ]);
//	console.log("JS: document.body.scrollWidth              : " + document.body.scrollWidth);		///* DEBUG COMMENT */
//	console.log("JS: documentElement.clientWidth/scrollMaxX : " + document.body.clientWidth + ' + ' +  window.scrollMaxX );		///* DEBUG COMMENT */
//	console.log("JS: document.body.scrollHeight              : " + document.body.scrollHeight);		///* DEBUG COMMENT */
//	console.log("JS: documentElement.clientHeight/scrollMaxY : " + document.body.clientHeight + ' + ' +  window.scrollMaxY );		///* DEBUG COMMENT */
});
