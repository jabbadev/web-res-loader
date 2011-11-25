(function(global,config){
	var wrlc = config.wrlcNS;
	
	function wrlcConfig() {
			this.js = {	
				a: { name : "a", url : "/web-res-loader/demo/res/a.js", depon : ["e","f"] },
				b: { name : "b", url : "/web-res-loader/demo/res/b.js"},
				c: { name : "c", url : "/web-res-loader/demo/res/c.js"},
				d: { name : "d", url : "/web-res-loader/demo/res/d.js", depon : ["b"] },
				e: { name : "e", url : "/web-res-loader/demo/res/e.js", depon : ["g"] },
				f: { name : "f", url : "/web-res-loader/demo/res/f.js", depon : ["h"] },
				g: { name : "g", url : "/web-res-loader/demo/res/g.js", depon : ["l","i"] },
				h: { name : "h", url : "/web-res-loader/demo/res/h.js", depon : ["c","d"] },
				i: { name : "i", url : "/web-res-loader/demo/res/i.js"},
				l: { name : "l", url : "/web-res-loader/demo/res/l.js"}
			};
			
			this.css = {
				cssA : { name : "cssA", url : "/jdocgui/docgui/js/plugins/doc-metas/css/docMetas.css" },
				cssB : { name : "cssB", url : "/jdocgui/docgui/js/plugins/docgui-widget/css/docgui-table.css" }
			};
			
			this.html = {
				htmlA : { url : "/jdocgui/docgui/views/plugins/docMetas.html" },
				htmlB : { url : "/jdocgui/docgui/js/plugins/doc-metas/html/docMetas.html" }
			};
	};
	
	global[wrlc] = new wrlcConfig();
})(window,{ wrlcNS : "wrlc" });