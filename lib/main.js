/* MPL 2.0 Author : HideAway */

const { Cc , Ci , Cu , Cr} = require("chrome");
const tabs = require('tabs');
const windows = require("windows");
const dc = require("dietCookie");

exports.main = function(options, callbacks){
	//console.log(options.loadReason + " + " + callbacks);
	if ( options.loadReason == "install" ){
		dc.addSnack("mozilla.org" , "persona.org");
//		console.log("Installed Diet Cookie!");	///* DEBUG COMMENT */
	}
	dc.snackListWidget.init();
	dc.cookieListWidget.init();
	
	/*************************/
	/** cookieList Listener **/
	/*************************/
	dc.cookieListWidget.dcPanel.on("show", function() {
//		console.log('Event : cookieListWidget -> show');	///* DEBUG COMMENT */
  		dc.cookieListWidget.onPopup();
	});
	
	dc.cookieListWidget.dcPanel.port.on("panel-resize", function(size) {
//		console.log('Event : cookieListWidget -> panel-resize : ' + size );	///* DEBUG COMMENT */
		dc.cookieListWidget.onPanelResize(size);
	});
	
	dc.cookieListWidget.dcPanel.port.on("delete-Cookie", function(url) {
//		console.log('Event : cookieListWidget -> delete-Cookie : ' + url );	///* DEBUG COMMENT */
  		dc.cookieListWidget.onDeleteCookie(url);
	});

	/*************************/
	/** snackList Listener  **/
	/*************************/
	dc.snackListWidget.dcPanel.on("show", function() {
//		console.log('Event : snackListWidget -> show');	///* DEBUG COMMENT */
  		dc.snackListWidget.onPopup();
	});
	
	dc.snackListWidget.dcPanel.port.on("panel-resize", function(size) {
//		console.log('Event : snackListWidget -> panel-resize : ' + size );	///* DEBUG COMMENT */
  		dc.snackListWidget.onPanelResize(size);
	});
	
	dc.snackListWidget.dcPanel.port.on("add-Whitelist", function([pUrl , cUrl]) {
//		console.log('Event : snackListWidget -> add-Whitelist : ' + pUrl + ' -> ' + cUrl );	///* DEBUG COMMENT */
		dc.snackListWidget.onAddSnackList(pUrl , cUrl);
	});
	
	dc.snackListWidget.dcPanel.port.on("delete-WhiteList", function([pUrl , cUrl]) {
//		console.log('Event : snackListWidget -> delete-WhiteList : ' + pUrl + " -> " + cUrl );	///* DEBUG COMMENT */
  		dc.snackListWidget.onDeleteWhiteList(pUrl , cUrl);
	});
	
	/*************************/
	/** dietCookie Listener **/
	/*************************/
    windows.browserWindows.on('open', function(window) {
//        console.log('Event : Window -> open');	///* DEBUG COMMENT */
		dc.dietWithCookie();
	});


	windows.browserWindows.on('close', function(window) {
//        console.log('Event : Window -> close');	///* DEBUG COMMENT */
//		//dc.getTabList()	///* DEBUG COMMENT */
		dc.dietWithCookie();
	});
    
    tabs.on('open', function() {
//    	console.log('Event : tabs -> open');	///* DEBUG COMMENT */
		dc.dietWithCookie();
	});
	
	tabs.on('close', function( tab ) {
		//tab.close(hoge);
//		console.log('Event : tabs -> close [' + tab.index + '] ' + tab.url);	///* DEBUG COMMENT */
//		//dc.getTabList()	///* DEBUG COMMENT */
		dc.dietWithCookie(tab);
	});
	
	tabs.on('ready', function(tab){
//		console.log('Event : tabs -> ready [' + tab.index + '] ' + tab.url);	///* DEBUG COMMENT */
        dc.dietWithCookie();
	});
}
