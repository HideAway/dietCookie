/* MPL 2.0 Author : HideAway */ 

const { Cc , Ci , Cu , Cr} = require("chrome");

const tabs = require('tabs');
const windows = require("windows");
const url = require('url');
const ss = require("simple-storage");
const sss = ss.storage;
const widgets = require("widget");
const panels = require("panel");
const data = require("self").data;
const winUtils = require("window-utils");

var cookieListWidget ={
	dcWidget : null ,
	dcPanel : null ,
	init : function(){
		this.dcPanel = panels.Panel({
					width: 1, ///* Need Resize */
					height: 1, ///* Need Resize */
					contentScriptFile: [data.url("menuPopup.js") , data.url("jquery-1.8.3.min.js") ],
					contentURL: data.url("menuPopup.html"),
				});
		
		this.dcWidget = widgets.Widget({
				id: "dietCookie-Button:CookieList",
				label: "diet Cookie:CookieList",
				contentURL: data.url("dietCookieKake.png"),
				panel: this.dcPanel,
				});
	},
	
	onPopup : function(){
//		console.log('Event : cookieListWidget -> onPopup');	///* DEBUG COMMENT */
		//dietWithCookie();
		this.dcPanel.resize(1,1);
		this.dcPanel.port.emit("reflesh-Cookie-start");
		var cookieList = getUniqueCookieList();
		for ( var i=0; i<cookieList.length; i++ ){
			this.dcPanel.port.emit("add-Cookie",  cookieList[i] );
		}
//		console.log("List Length : " + cookieList.length); ///* DEBUG COMMENT */
		if ( cookieList.length == 0 ) {
			this.dcPanel.port.emit("no-Cookie");
		}
		this.dcPanel.port.emit("reflesh-Cookie-end");
	},
	
	onPanelResize : function(size){
		if ( size[1] > winUtils.activeBrowserWindow.document.height * 0.9 ) {
			size[1] = winUtils.activeBrowserWindow.document.height * 0.9;
		}
		this.dcPanel.resize(size[0] , size[1]);
	},
	
	onDeleteCookie : function(url){
//		console.log("Delete Cookie : " + url); ///* DEBUG COMMENT */
		deleteCookieFromHost(url);
	},
	

}
exports.cookieListWidget = cookieListWidget;

var getUniqueCookieList = function(){
	var ckM = Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager);
	var iter = ckM.enumerator;
	var cookieList = [];
	var uniqueList = [];
	while(iter.hasMoreElements()){
		var cookie = iter.getNext();
		if(cookie instanceof Ci.nsICookie){
			if ( !uniqueList[cookie.host] ){
				cookieList.push(cookie.host);
				uniqueList[cookie.host] = true;
			}
		}
	}
	return cookieList;
}
	
var deleteCookieFromHost = function(url){
	var ckM = Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager);
	var iter = ckM.enumerator;
	while(iter.hasMoreElements()){
		var cookie = iter.getNext();
		if(cookie instanceof Ci.nsICookie){
			if ( url == cookie.host  ){
				ckM.remove(cookie.host , cookie.name , cookie.path , false);
			}
		}
	}
}

var snackListWidget = {
	dcWidget : null,
	dcPanel : null,
	
	init : function(){
		if ( !sss.dcSnackList ) {
//			console.log("New Empty SnackList"); ///* DEBUG COMMENT */
			sss.dcSnackList = [];
		}
		if ( !sss.dcGlobalSnackList ) {
//			console.log("New Empty GlobalSnackList"); ///* DEBUG COMMENT */
			sss.dcGlobalSnackList = [];
		}
		this.dcPanel = panels.Panel({
					width: 1, ///* Need Resize */
					height: 1, ///* Need Resize */
					contentScriptFile: [ data.url("menuPopup.js") , data.url("jquery-1.8.3.min.js")],
					contentURL: data.url("menuPopup.html"),
				});
		
		this.dcWidget = widgets.Widget({
				id: "dietCookie-Button:WhiteList",
				label: "diet Cookie:WhiteList",
				contentURL: data.url("dietCookie.png"),
				panel: this.dcPanel,
				});
	},
	
	onPopup : function(){
		this.dcPanel.port.emit("reflesh-Snack-start");
		for ( var i=0; i< sss.dcSnackList.length; i++){
			this.dcPanel.port.emit("add-Snack" , [ sss.dcSnackList[i][0] ,  sss.dcSnackList[i][1]]);
		}
		for ( var i=0; i< sss.dcGlobalSnackList.length; i++){
			this.dcPanel.port.emit("add-Snack" , [ sss.dcGlobalSnackList[i][0] ,  sss.dcGlobalSnackList[i][1]]);
		}
		if ( sss.dcSnackList.length == 0 ){
			this.dcPanel.port.emit("no-Snack");
		}
		this.dcPanel.port.emit("reflesh-Snack-end");
	},
	
	onPanelResize : function(size){
		if ( size[1] > winUtils.activeBrowserWindow.document.height * 0.9 ) {
			size[1] = winUtils.activeBrowserWindow.document.height * 0.9;
		}
		this.dcPanel.resize(size[0] , size[1]);
	},
	
	onAddSnackList : function(pUrl , cUrl){
		if ( pUrl && cUrl ) {
			addSnack(pUrl,cUrl);
			this.dcPanel.port.emit("added-WhiteList" , [pUrl , cUrl]);
			this.dcPanel.hide();
		} else { 
			
		}
	},
	
	onDeleteWhiteList : function(pUrl , cUrl){
		this.dcPanel.hide();
		deleteSnack(pUrl,cUrl);
	},
}
exports.snackListWidget = snackListWidget;

var deleteSnack = function(pUrl , cUrl){
	if ( !pUrl || !cUrl ) { return [null, null]; }
	if ( isValidURL(pUrl) ) { pUrl = url.URL(pUrl).host; }
	if ( isValidURL(cUrl) ) { cUrl = url.URL(cUrl).host; }
	if ( !isStrictDomain(pUrl) ) { return [null, null] }
	if ( !isStrictDomain(cUrl) ) { return [null, null] }
	pUrl = pUrl.charAt(0) == "." ? pUrl : "." + pUrl;
	cUrl = cUrl.charAt(0) == "." ? cUrl : "." + cUrl;
	for ( var i=0; i<sss.dcSnackList.length; i++ ){
		if ( sss.dcSnackList[i][0] == pUrl && sss.dcSnackList[i][1] == cUrl ){
			sss.dcSnackList.splice(i,1);
			return [pUrl , cUrl];
		}
	}
	for ( var i=0; i<sss.dcGlobalSnackList.length; i++ ){
		if ( sss.dcGlobalSnackList[i][0] == pUrl && sss.dcGlobalSnackList[i][1] == cUrl ){
			sss.dcGlobalSnackList.splice(i,1);
			return [pUrl , cUrl];
		}
	}
	return [ null , null ];
}


var addSnack = function(pUrl , cUrl ){
	var globalFlag = false;
	if ( !pUrl || !cUrl ) { return [null, null]; }
	if ( isValidURL(pUrl) ) { pUrl = url.URL(pUrl).host; }
	if ( isValidURL(cUrl) ) { cUrl = url.URL(cUrl).host; }
	if ( !isStrictParentDomain(pUrl) ) { return [null, null] }
	if ( !isStrictDomain(cUrl) ) { return [null, null] }
	if ( pUrl == "*" ) {
		globalFlag = true;
	 } else {
		pUrl = pUrl.charAt(0) == "." ? pUrl : "." + pUrl;
	}
		cUrl = cUrl.charAt(0) == "." ? cUrl : "." + cUrl;
	
	var uniqueCk = true; 
	for ( var i=0; i<sss.dcSnackList.length; i++ ){
		if ( sss.dcSnackList[i][0] == pUrl && sss.dcSnackList[i][1] == cUrl ){
			var uniqueCk = false;
		}
	}
	if ( uniqueCk ){
		if ( globalFlag ){
			sss.dcGlobalSnackList.push([pUrl , cUrl]);
			return [pUrl , cUrl];
		}  else {
			sss.dcSnackList.push([pUrl , cUrl]);
			return [pUrl , cUrl];
		}
	}
	return [null, null];
}
exports.addSnack = addSnack;

function isValidURL(url){
	 return /^(ftp|https?):\/\/+(www\.)?([a-z0-9\-\.]{3,}\.[a-z]{2}|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/.test(url);
}

function isStrictDomain(url){
	return /^(www\.)?([a-z0-9\-\.]{3,}\.[a-z]{2}|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/.test(url);
}


function isStrictParentDomain(url){
	return /^\*$/.test(url)  ||  /^(www\.)?([a-z0-9\-\.]{3,}\.[a-z]{2}|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/.test(url);
}


var dietWithCookie = function(){
//	console.log("");			///* DEBUG COMMENT */
//	console.log("");			///* DEBUG COMMENT */
//	console.log("");			///* DEBUG COMMENT */
//	console.log("+++++ dietWithCookie +++++");	///* DEBUG COMMENT */
	var ckM = Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager);
	var iter = ckM.enumerator;
	
	var SnackHost = [];
	var SnackDomain = [];
	var UniqueList = [];
	
	for each ( var window in windows.browserWindows){
		for each ( var tab in window.tabs ){
			if ( tab.url.substring(0,4) == 'http'){
				var clipedUrl = "." + url.URL(tab.url).host ; ///* .www.site.com or .192.168.0.1 */
				var domainUrl = getBaseDomainFromHost("http://" + url.URL(tab.url).host); ///* .site.com or false */
//				console.log("CLIPED : " + clipedUrl); ///* DEBUG COMMENT */
//				console.log("DOMAIN : " + domainUrl); ///* DEBUG COMMENT */
				if ( !UniqueList[clipedUrl] ){
					UniqueList[clipedUrl] = true;
					SnackHost.push(clipedUrl);
					if ( clipedUrl != domainUrl && domainUrl ){
						SnackDomain.push(domainUrl);
					}
					
					for ( var i=0; i<sss.dcSnackList.length; i++ ){
						if ( sss.dcSnackList[i][0] == clipedUrl ){
							SnackHost.push(sss.dcSnackList[i][1]);
							UniqueList[dcStorage.dcSnackList[i][1]] = true;
						} else if ( sss.dcSnackList[i][0] == domainUrl ){
							SnackHost.push(sss.dcSnackList[i][1]);
							UniqueList[sss.dcSnackList[i][1]] = true;
						}
					}
				}
			}
		}
	}
	
	for (var i=0; i<sss.dcGlobalSnackList.length; i++ ){
		if ( !UniqueList[sss.dcGlobalSnackList[i][1]] ){
			UniqueList[sss.dcGlobalSnackList[i][1]] = true;
			SnackHost.push(sss.dcGlobalSnackList[i][1]);
		}
	}
	
	///*********************************************************************************/
	// Snack Host/Domain Ex.
	// Keep : Snack Host <= Cookie URL : 
	// Keep : Snack Dmaon == Cookie URL
	///*********************************************************************************/
	
//	for each ( var allows in SnackHost ){							///* DEBUG COMMENT */
//		console.log("SnackHost : " + allows);						///* DEBUG COMMENT */
//	}																///* DEBUG COMMENT */
//	for each ( var allows in SnackDomain ){							///* DEBUG COMMENT */
//		console.log("SnackDomain : " + allows);						///* DEBUG COMMENT */
//	}																///* DEBUG COMMENT */
//	console.log("***** dietWithCookie *****");						///* DEBUG COMMENT */
	
//	var cookieNum = 0; ///* DEBUG COMMENT */
	while(iter.hasMoreElements()){
		var cookie = iter.getNext();
		if(cookie instanceof Ci.nsICookie){
//			cookieNum ++ ///* DEBUG COMMENT */
			var sCookieUrl = ( cookie.host.substring(0,1) == "." ) ? cookie.host : "." + cookie.host ;
			var deleteFlag = true;
			for each ( var snackUrl in SnackHost ){
				if ( sCookieUrl.length >= snackUrl.length) {
					if ( snackUrl == sCookieUrl.substring(sCookieUrl.length - snackUrl.length ) ){
						deleteFlag = false;
						break;
					}
				}
			}
			
			for each ( var snackDmn in SnackDomain ){
				if ( !deleteFlag ) { break;}
				if ( sCookieUrl.length == snackDmn.length) {
					if ( snackDmn == sCookieUrl ){
						deleteFlag = false;
						break;
					}
				}
			}
			if ( deleteFlag == true ){
				ckM.remove(cookie.host , cookie.name , cookie.path , false);
//				console.log('-- : ' + cookie.host + ' : ' + cookie.name); ///* DEBUG COMMENT */
			} else {
//				console.log('++ : ' + cookie.host + ' : ' + cookie.name); ///* DEBUG COMMENT */
			}
		}
	}
//	console.log('-- [' + cookieNum + '] Diet Cookie --'); ///* DEBUG COMMENT */
}
exports.dietWithCookie = dietWithCookie;

var getPublicSuffixFromHost = function(aHost){
	var tldService = Cc["@mozilla.org/network/effective-tld-service;1"].getService(Ci.nsIEffectiveTLDService);
	try {
		return tldService.getPublicSuffixFromHost(aHost);
  	} catch (ex) {
//		console.log('ERR:'+ex);	///* DEBUG COMMENT */
		return false;
	}
}

var getBaseDomainFromHost = function(aHost){
	var reg4 = new RegExp('^https?:\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}','i');
	var reg6 = new RegExp('^https?:\/\/[0-9a-zA-Z]{0,4}:[0-9a-zA-Z]{0,4}:[0-9a-zA-Z]{0,4}','i');
	if ( aHost.substring(0,4) != 'http'){ return false; }
	if ( reg4.test(aHost) ){ return false; }
	if ( reg6.test(aHost) ){ return false; }
	
	var tldService = Cc["@mozilla.org/network/effective-tld-service;1"].getService(Ci.nsIEffectiveTLDService);
	try {
		var  num = getPublicSuffixFromHost(aHost).split(".").length;
  	} catch (ex) {
//		console.log('ERR:' + ex);	///* DEBUG COMMENT */
		return false;
	}
	var aUrl = aHost.split(".");
	var bUrl = '';
	for ( i = aUrl.length - num - 1; i <= aUrl.length - 1; i++){
		bUrl = bUrl +  "." +  aUrl[i];
	}
	return bUrl;
}

var getTabList = function(){
	console.log("here getTabList");
	for each ( var window in windows.browserWindows){
		console.log("window");
		for each ( var tab in window.tabs ) {
			if ( tab.unread ){
				console.log("tab : " + tab.url + ' Unread' );
			} else{ 
				console.log("tab : " + tab.url + ' Read' );
			}
			if ( tab.url.substring(0,4) == 'http'){
				console.log("TAB : " +  "." + url.URL(tab.url).host );
			}
		}
	}
}
exports.getTabList = getTabList;

