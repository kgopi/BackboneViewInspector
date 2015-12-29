// IFrame content load detector
(function(){
    window.gsdev || (window.gsdev = {});
    window.gsdev.core || (window.gsdev.core = {});

    window.gsdev.core.isFrameReady = function(iFrame, fn) {
        var timer;
        var fired = false;

        function ready() {
            if (!fired) {
                fired = true;
                clearTimeout(timer);
                fn.call(this);
            }
        }

        function readyState() {
            if (this.readyState === "complete") {
                ready.call(this);
            }
        }

        iFrame.addEventListener("load", function () {
            try{
                ready.call(iFrame.contentDocument || iFrame.contentWindow.document);
            }
            catch (e){

            }
        });

        function checkLoaded() {
            try{
                var doc = iFrame.contentDocument;
            }
            catch (e){
                return;
            }
            if (doc.URL.indexOf("about:") !== 0) {
                if (doc.readyState === "complete") {
                    ready.call(doc);
                } else {
                    doc.addEventListener("DOMContentLoaded", ready);
                    doc.addEventListener("readystatechange", readyState);
                }
            } else {
                timer = window.setTimeout(checkLoaded, 1);
            }
        }
        checkLoaded();
    }
})();


document.addEventListener("DOMContentLoaded", function(event) {
	gsdev.core.injectScripts(document);
});

(function(){

	window.gsdev || (window.gsdev = {});
    window.gsdev.core || (window.gsdev.core = {});

    window.gsdev.core.getIFrameObserver = function(){
        if(!gsdev.core.iframeObserver){
            gsdev.core.iframeObserver = new MutationObserver(function(mutations) {
                for (mutationIdx in mutations) {
                    var mutation = mutations[mutationIdx];
                    for (childIndex in mutation.addedNodes) {
                        var child = mutation.addedNodes[childIndex];
                        if (child.tagName && child.tagName.toLowerCase() == 'iframe') {
                            gsdev.core.isFrameReady(child, function(){
                                gsdev.core.injectScripts(this);
                            });
                        }
                    }
                }
            });
        }
        return gsdev.core.iframeObserver;
    };
    window.gsdev.core.injectScripts = function(doc){
        gsdev.core.loadScriptOnPage(doc, 'js/lib/object-watch.js');
        gsdev.core.loadScriptOnPage(doc, 'js/inject.js');
        var config = { attributes: false, subtree: true, childList: true, characterData: false };
        gsdev.core.getIFrameObserver().observe(doc.body, config);
        for(var i=0; i<doc.defaultView.frames.length; i++){
            try{
                var _doc = doc.defaultView.frames[i].contentDocument;
            }
            catch (e){ // iframe window is not accessible (cross domain?)
                return;
            }
            // No need to load on the same window again
            doc.defaultView != _doc.defaultView && gsdev.core.injectScripts(_doc);
        }
    };

    window.gsdev.core.loadScriptOnPage = function(doc, url){
        var s = doc.createElement('script');
        s.setAttribute('type', 'text/javascript');
        s.setAttribute('src', chrome.extension.getURL(url));
        doc.body.firstChildElement ? doc.body.insertBefore(s, doc.body.firstChildElement)
            : doc.body.appendChild(s);
    }

	gsdev.plugin = (function(){

		var _wrapper = null;

		function init(){
			initWrapper();
			attachEvents();
		}

		function destroy(){
			detachEvents();
		}
		
		function initWrapper(){
			_wrapper = document.createElement('div');
			_wrapper.id = "__wrapper";
			_wrapper.addEventListener('click', wrapperClickHandler);
			document.body.appendChild(_wrapper);
		}

		function wrapperClickHandler(eve){
			if(_wrapper.isActive){
				_wrapper.className = "";
				_wrapper.isActive = false;
				on();
			}
			else {
				_wrapper.className = "active";
				_wrapper.isActive = true;
				off();
				showDetailView(_wrapper.activeElement);
			}
		}

		function showDetailView(ele){
			//$.getScript();
		}

		function getElementToBeHighlighted(eve){
			var element,
				x = eve.clientX,
				y = eve.clientY,
				elements = document.elementsFromPoint(x, y);
			element = elements.find(function(element){
				if(element != _wrapper){
					return true;
				}
				return false;
			});
			return $(element).closest("[view-url]")[0];
		}

		function _positionWrapper(eve){
			var eleToBeHighlighted = getElementToBeHighlighted(eve);
			if(!eleToBeHighlighted){
				hideWrapper();
			}
			else if(eleToBeHighlighted != _wrapper.activeElement){
				var position = eleToBeHighlighted.getBoundingClientRect();
				_wrapper.activeElement = eleToBeHighlighted;
				_wrapper.title = eleToBeHighlighted.getAttribute('view-url');
				_wrapper.style.top = position.top + "px";
				_wrapper.style.left = position.left + "px";
				_wrapper.style.width = eleToBeHighlighted.clientWidth + "px";
				_wrapper.style.height = eleToBeHighlighted.clientHeight + "px";
				_wrapper.style.display = "block";
			}
		}

		function positionWrapper(eve){
			window.setTimeout(function(eve){
				_positionWrapper(eve);
			}, 200, eve);
		}

		function messageListener(message){
			if(message.action == "ON_TRACKER"){
				on();
			}
			else if(message.action == "OFF_TRACKER"){
				hideWrapper();
				off();
			}
		}

		function attachEvents(){
			chrome.runtime.onMessage.addListener(messageListener);
			document.addEventListener('unload', destroy);
		}

		function on(){
			document.addEventListener('mousemove', positionWrapper, true);
		}

		function off(){
			document.removeEventListener('mousemove', positionWrapper, true);
		}

		function hideWrapper(){
			_wrapper.style.display = "none";
		}

		function detachEvents(){
			hideWrapper();
			off();
		}

		return {
			init: init
		}

	})();

	window.onload = function(){
		gsdev.plugin.init();
	}
})();