/**
 * Created by KGopi on 12/3/2015.
 */

(function(){

    function _messageListener(message){
        if(message.action == "SEND_VIEW_COUNT"){
            sendViewCount2Background();
        }
    }

    function sendViewCount2Background(){
        var event = new CustomEvent('SEND_VIEW_COUNT');
        document.dispatchEvent(event);
    }

})();

(function(){

	window.BVT || (window.BVT = {});
    window.BVT.core || (window.BVT.core = {});

    window.BVT.core.injectScripts = function(doc){
        BVT.core.loadScriptsOnPage(doc, ['js/lib/object-watch.js', 'js/inject.js']);
    };

    window.BVT.core.loadScriptsOnPage = function(doc, scripts){
        var s = doc.createElement('script');
        s.setAttribute('type', 'text/javascript');
        if(doc.body){
            doc.body.firstElementChild ? doc.body.insertBefore(s, doc.body.firstElementChild)
                : doc.body.appendChild(s);
        }else{
            doc.head.firstElementChild ? doc.head.insertBefore(s, doc.head.firstElementChild) : doc.head.appendChild(s);
        }

        s.onload = function(eve){
            if(scripts.length) {
                window.BVT.core.loadScriptsOnPage(doc, scripts);
            }
        }
        s.setAttribute('src', chrome.extension.getURL(scripts.shift()));
    }
})();

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        var hBNode = Array.prototype.find.call(mutation.addedNodes, function(node){
            return node.nodeName.toLowerCase().match(/(head|body)/);
        });
        if(hBNode){
            observer.disconnect();
            BVT.core.injectScripts(document);
        }
    });
});

// configuration of the observer:
var config = {attributes: false, childList: true, characterData: false, subtree: false, attributeOldValue: false};

// pass in the target node, as well as the observer options
observer.observe(document.documentElement, config);

document.addEventListener("DOMContentLoaded", function(event) {
    observer.disconnect();
});

document.addEventListener("SHOW_BANNER_TEXT", function(event) {
    chrome.runtime.sendMessage(""+chrome.runtime.id, {data: event.detail});
});

