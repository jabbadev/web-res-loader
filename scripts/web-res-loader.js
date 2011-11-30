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
			if ( jsURL ){
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
			}
			else {
				eventLoadHandler();
			}
		};
		
		this._attachCSS = function(cssURL){
			if ( cssURL ){
				var style_tag = document.createElement("link");
				style_tag.setAttribute("type","text/css");
				style_tag.setAttribute("rel","stylesheet");
				style_tag.setAttribute("href",cssURL);
				(document.getElementsByTagName("head")[0]||document.documentElement).appendChild(style_tag);
			}
		};
		
		this._attachRES = function(resType,resName,eventLoadHandler){
			if ( ! this[resType][resName].isAttach ){
				(typeof(this[resType][resName].preLoad)==="function") && this[resType][resName].preLoad();
				if (resType == "js" ){
					this._attachJS(this[resType][resName].url,eventLoadHandler);
				}
				if (resType == "css"){
					this._attachCSS(this[resType][resName].url);
					(typeof(this[resType][resName].postLoad)==="function") && this[resType][resName].postLoad();
				}
				this[resType][resName].isAttach = true;
			}
		};
		
		this._getChainRes = function(resType,resName) {
			var rl = this;
			var res = function(resType,resName){
				this.resType = resType;
				this.resName = resName;
				this.dep = null;
				
				this.setAttach = function(){
					var self = this;
					this.attach = function(){
						if ( self.resType == "js" ){
							rl._attachRES(self.resType,self.resName,self.onload);
						}
						if ( self.resType == "css" ){
							rl._attachRES(self.resType,self.resName);
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
				if ( this[resType][resName].isLoaded || false ){
					setTimeout(this._waitLoadHandler(resType,resName,resDep,nextLoadHandler),0);
				}
			}
			this[resType][resName].isLoaded = true;
			
			( typeof(this[resType][resName].postLoad)==="function" ) && this[resType][resName].postLoad();
			
			nextLoadHandler();
		};
		
		this._buildLoadChain = function(resType,resName,chain) {
			var dep = this[resType][resName].depon;
			if ( dep ){
				for( var i in dep ){
					this._buildLoadChain(resType,dep[i],chain);
					var res = this._getChainRes(resType,dep[i]);
					res.setAttach();
					
					if (resType == "js"){
						if ( chain.length > 0 ){
							res.dep = chain[chain.length-1].resName;
							chain[chain.length-1].setOnLoad(res.attach);
						}
					}
					
					chain.push(res);
				}
			}
		};
		
		this._loadRes = function(resType,resName,callback,ctxt) {
			var chain = [];
			this._buildLoadChain(resType,resName,chain);
			
			var res = this._getChainRes(resType,resName);
			res.setAttach();
			if( resType == "js"){	
				if ( chain.length > 0 ){
					res.dep = chain[chain.length-1].resName;
					chain[chain.length-1].setOnLoad(res.attach);
				}
			}
			
			chain.push(res);
			
			var c = ctxt || global;
			var f = typeof(callback) === "function" && this.jq.proxy(callback,c) || function(){};
			chain[chain.length-1].setOnLoad(f);
			
			( resType == "js" ) && chain[0].attach();
			if ( resType == "css" ){
				this.jq.each(chain,function(i,res){ res.attach(); });
				( typeof(callback) === "function" ) && (this.jq.proxy(callback,c))();
			}
		};
		
		this.loadJS = function(resName,callback,ctxt){
			this._loadRes("js",resName,callback,ctxt);
		};
		
		this.loadCSS = function(resName,callback,ctxt){
			this._loadRes("css",resName,callback,ctxt);
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

	};
	
	global[wrl] = new webResLoader();
})(window,{
	wrlNS : "wrl",
	wrlcNS : "wrlc"
});