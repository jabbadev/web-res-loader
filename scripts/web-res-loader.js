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
		
		this._getChainRes = function(resType,resName,callback) {
			var rl = this;
			
			var res = function(resType,resName){
				this.resType = resType;
				this.resName = resName;
				this.dep = null;
				
				this.setAttach = function(){
					var self = this;
					this.attach = function(){
						if ( self.resType == "js" ){
							rl._attachJS(rl[self.resType][self.resName].url,self.onload);
						}
						if ( self.resType == "css" ){
							rl._attachCSS(rl[self.resType][self.resName].url,self.onload);
						}
					};
				};
				this.setOnLoad = function(nextf){
					var self = this;
					this.onload = function(){
						rl._waitLoadHandler(self.resType,self.resName,self.dep,nextf); 
					};
				};
			};
			
			return new res(resType,resName);
		};
		
		this._waitLoadHandler = function(resType,resName,resDep,nextLoadHandler) {
			if ( resDep ){
				if ( this[resType][resName].isNotLoaded ){
					setTimeout(this._waitLoadHandler(resType,resName,resDep,nextLoadHandler),0);
				}
				else {
					this[resType][resName].isNotLoaded = false;
				}
			}
			else {
				this[resType][resName].isNotLoaded = false;
			}
			nextLoadHandler();
		};
		
		this.buildLoadChain = function(resType,resName,chain,callback) {
			var dep = this[resType][resName].depon;
			if ( dep ){
				for( var i in dep ){
					this.buildLoadChain(resType,dep[i],chain,callback);
					var res = this._getChainRes(resType,dep[i],callback);
					res.setAttach();
					res.setOnLoad(callback);
					
					if ( chain.length > 0 ){
						res.dep = chain[chain.length-1].resName;
						chain[chain.length-1].setOnLoad(res.attach);
					}
					
					chain.push(res);
					
				}
			}
		};
		
		this.loadRes = function(resType,resName,callback) {
			var chain = [];
			this.buildLoadChain(resType,resName,chain,callback);
			
			var res = this._getChainRes(resType,resName,callback);
			res.setAttach();
			res.setOnLoad(callback);
			
			if ( chain.length > 0 ){
				res.dep = chain[chain.length-1].resName;
				chain[chain.length-1].setOnLoad(res.attach);
			}
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