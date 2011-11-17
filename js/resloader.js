(function(global,obj){
	
	function resloader() {
		this.jsList = null;
		this.cssList = null;
		this.htmlList = null;
		
		this.loadConfig = function(resconf,initCallBack,getExec){
			this.jsList = resconf.jsList;
			this.cssList = resconf.cssList;
			this.htmlList = resconf.htmlList;
			( initCallBack ) && initCallBack();
			if ( getExec ){
				this.setUpGetExec(getExec);
			}
		};
		
		this.setUpGetExec = function(getExec){
			this.getExec = function(url,ctxt){getExec.call(ctxt,url);};
		};
		
		this.loadHTML = function(htmlName,ctxt) {
			this.getExec(this.htmlList[htmlName].url,ctxt);
		};
		
		this.waitForDep = function( js ) {
			var self = this;
			if ( this.depNotReady( js.depon ) ) {
				setTimeout(function(){self.waitForDep( js );},1);
			}
		};
		
		this.notifyJsLoaded = function( js ) {
			js.postLoadActivity();
			this.jsList[js.name].isNotLoaded = false;
			/* this.jsList[js.name].isNotLocked = false; */
			/* console.log('notifyJsLoaded [ ' + js.name + ' ]'); */
		};
		
		this.depNotReady = function( depToWait ){
			for( var i in depToWait ){
				var _js = this.jsList[depToWait[i]];
				if( _js.isNotLoaded ) {
					return _js.isNotLoaded;
				}
			}
			return false;
		};
		
		this.loadJS = function ( jsName ) {
			var self = this;
			var js = this.jsList[jsName];
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
			var css = this.cssList[cssName];
			if ( css.isNotLoaded ){
				var style_tag = document.createElement("link");
				style_tag.setAttribute("type","text/css");
				style_tag.setAttribute("rel","stylesheet");
				style_tag.setAttribute("href",css.url);
				(document.getElementsByTagName("head")[0]||document.documentElement).appendChild(style_tag);
				this.cssList[cssName].isNotLoaded = false;
			}
		};
		
		this.docguiInitChain = function() {
			this.loadCSS("uiDefaulTema");
			this.docgui.loadJS("baseWidget");
		};
		
		this.loadCssList = function( cssList ){
			for ( var i in cssList ){
				this.loadCSS(cssList[i]);
			}
		};
		
		this.loadJsList = function( widgetList ){
			for ( var i in widgetList ){
				this.loadJS(widgetList[i]);
			}
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
	
	global.resloader = new resloader();
})(window);