(function(global,config){
	var wrl = config.wrlNS;
	var wrlc = config.wrlcNS;
	
	function webResLoader() {

		this.loadConfig = function(jq,rlcURL,callback){
			var self = this;
			this.jq = jq;
			this.rlcURL = rlcURL;
			this._attachJS(this.rlcURL,
			function(){
				self.setConfig(wrlc);
				callback();
			});
		};
		
		this.setConfig = function(wrlc){
			this.js = global[wrlc].js;
			this.css = global[wrlc].css;
			this.html = global[wrlc].html;
		};
		
		this._attachJS = function(jsURL,eventLoadHandler){
			console.log('FIRE ATTACH: ',jsURL);
			var plugin_script_tag = document.createElement("script");
			plugin_script_tag.setAttribute("type","text/javascript");
			plugin_script_tag.setAttribute("charset","utf-8");
			plugin_script_tag.setAttribute("src",jsURL);
			plugin_script_tag.onload = eventLoadHandler;
			plugin_script_tag.onreadystatechange = function () { /* Same thing but for IE */
				if (this.readyState == "complete" || this.readyState == "loaded") {
					eventLoadHandler();
			    }
			};
			(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(plugin_script_tag);
		};
		
		this._attachCSS = function(cssURL,eventLoadHandler){
		};
		
		this._getChainRes = function(resType,resName) {
			var self = this;
			var res = function(resType,resName){
				this.resType = resType;
				this.resName = resName;
				this._setAttachRes = function(){
					this.attach = function(){
						if ( this.resType == "js" ){
							console.log('fire attach: ',resName,resType);
							self._attachJS(self[resType][resName].url,this.loadHandler);
						}
						if ( this.resType == "css" ){
							self._attachCSS(self[resType][resName].url,this.loadHandler);
						}
					};
				};
				this.attach = null;
				this._setLoadHandler = function(loadHandler){
					var _self = this;
					this.loadHandler = function(){
						self._waitLoadHandler(_self.resType,_self.resName,loadHandler); 
					};
				};
				this.loadHandler = null;
				this.nextNameRes = null;
			};
			
			return new res(resType,resName);
		};
		
		this._waitLoadHandler = function(resType,resName,nextLoadHandler) {
			console.log('next handler: ',resType,resName,nextLoadHandler);
			/*
			if ( ! this[resType][resName].isLoaded ){
				setTimeout(this._waitLoadHandler(resType,resName,nextLoadHandler),0);
			}
			else {
				this.nextLoadHandler;
			}*/
			//next = nextLoadHandler;
			nextLoadHandler();
		};
		
		this.buildLoadChain = function(resType,name,chain,callback) {
			var dep = this[resType][name].depon;
			if ( dep ){
				for( var i in dep ){
					this.buildLoadChain(resType,dep[i],chain,callback);
					var res = this._getChainRes(resType,dep[i]);
					res._setAttachRes();
					res._setLoadHandler(callback);					
					chain.push(res);
					
					if ( chain.length > 1){
						chain[chain.length-2]._setLoadHandler(function(){res.attach();});
					}
						
				}
			}
		};
		
		this.loadRes = function(resType,resName,callback) {
			var chain = [];
			this.buildLoadChain('js',"a",chain,callback);
			var res = this._getChainRes("js","a");
			res._setAttachRes();
			chain.push(res);
			a = chain;
		};
			
		this.loadHTML = function(htmlName,success,error,ctxt,async) {
			var proxySuccess = this.jq.proxy(success,ctxt);
			var proxyError = this.jq.proxy(error,ctxt);
			
			this.jq.ajax({
				async : ( async === undefined && true ) || async,
				url : this.html[htmlName].url,
				success : proxySuccess,
				error : proxyError
			});
		};
		
		this.waitForDep = function( js ) {
			var self = this;
			if ( this.depNotReady( js.depon ) ) {
				setTimeout(function(){self.waitForDep( js );},1);
			}
		};
		
		this.notifyJsLoaded = function( js ) {
			js.postLoadActivity();
			this.js[js.name].isNotLoaded = false;
			/* this.jsList[js.name].isNotLocked = false; */
			/* console.log('notifyJsLoaded [ ' + js.name + ' ]'); */
		};
		
		this.depNotReady = function( depToWait ){
			for( var i in depToWait ){
				var _js = this.js[depToWait[i]];
				if( _js.isNotLoaded ) {
					return _js.isNotLoaded;
				}
			}
			return false;
		};
		
		this.loadJS = function ( jsName ) {
			var self = this;
			var js = this.js[jsName];
			var dep = js.depon;
			if ( dep.length > 0 ) {
				for ( var i in dep ){
					var jsname = dep[i];
					this.loadJS(jsname);
				}
			}
						
			if ( js.isNotLoaded ){
				if ( js.isNotLocked ){
					js.isNotLocked = false;
					if ( js.preLoadActivity() ) {
						
						var plugin_script_tag = document.createElement("script");
						plugin_script_tag.setAttribute("type","text/javascript");
						plugin_script_tag.setAttribute("charset","utf-8");
						plugin_script_tag.setAttribute("src", js.url);
						plugin_script_tag.onload = function() { self.notifyJsLoaded( js ); };
						plugin_script_tag.onreadystatechange = function () { /* Same thing but for IE */
							if (this.readyState == "complete" || this.readyState == "loaded") {
								self.notifyJsLoaded( js );
						    }
						};
						(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(plugin_script_tag);
						
						this.waitForDep( js );
					}
				}
			}
		};
		
		this.loadCSS = function ( cssName ) {
			var css = this.css[cssName];
			if ( css.isNotLoaded ){
				var style_tag = document.createElement("link");
				style_tag.setAttribute("type","text/css");
				style_tag.setAttribute("rel","stylesheet");
				style_tag.setAttribute("href",css.url);
				(document.getElementsByTagName("head")[0]||document.documentElement).appendChild(style_tag);
				this.css[cssName].isNotLoaded = false;
			}
		};
		
		this.loadCssList = function( cssList ){
			for ( var i in cssList ){
				this.loadCSS(cssList[i]);
			}
		};
		
		this.loadJsList = function(widgetList,callback,ctxt){
			for ( var i in widgetList ){
				this.loadJS(widgetList[i]);
			}
			var proxyCallback = this.jq.proxy(callback,ctxt);
			this.jsAreReady(widgetList,proxyCallback);
		};
		
		this.jsAreReady = function ( jsList, callback ) {
			var self = this;
			if ( this.depNotReady(jsList)){
				setTimeout( function(){self.jsAreReady(jsList,callback);},1 );
			}else {
				callback();
			}
		};
	};
	
	global[wrl] = new webResLoader();
})(window,{
	wrlNS : "wrl",
	wrlcNS : "wrlc"
});