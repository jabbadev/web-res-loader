(function(global,config){
	var wrlc = config.wrlcNS;
	
	function wrlcConfig() {
			this.js = {	
				a: { url : "/web-res-loader/demo/res/a.js", depon : ["e","f"] },
				b: { url : "/web-res-loader/demo/res/b.js"},
				c: { url : "/web-res-loader/demo/res/c.js"},
				d: { url : "/web-res-loader/demo/res/d.js", depon : ["b"] },
				e: { url : "/web-res-loader/demo/res/e.js", depon : ["g"] },
				f: { url : "/web-res-loader/demo/res/f.js", depon : ["h"] },
				g: { url : "/web-res-loader/demo/res/g.js", depon : ["l","i"],
					postLoad : function() {log.debug("Exec post load activity of g ...");},
					preLoad : function() {log.debug("Exec pre load activity of g ...");}},
				h: { url : "/web-res-loader/demo/res/h.js", depon : ["c","d"] },
				i: { url : "/web-res-loader/demo/res/i.js"},
				l: { url : "/web-res-loader/demo/res/l.js"},
				virtual : { depon : ["l","i"] },
				m :  { depon : ["virtual","h"] },
				n :  { url : "/web-res-loader/demo/res/n.js", depon : ["i","o"] },
				o :  { url : "/web-res-loader/demo/res/o.js", depon : ["i"] }
			};
			
			this.css = {
				a : { url : "/web-res-loader/demo/res/a.css", depon : ["b"] },
				b : { url : "/web-res-loader/demo/res/b.css", 
					preLoad : function(){ log.debug("Exec pre load activity of css g ..."); },
					postLoad : function(){ log.debug("Exec post load activity of css g ..."); }
				},
				c : { url : "/web-res-loader/demo/res/c.css" },
				resBundle : { depon : ["a","b"]}
			};
			
			this.html = {
				a : { url : "/jdocgui/docgui/views/plugins/docMetas.html" },
				b : { url : "/jdocgui/docgui/js/plugins/doc-metas/html/docMetas.html" },
			};
	};
	
	global[wrlc] = new wrlcConfig();
})(window,{ wrlcNS : "wrlc" });