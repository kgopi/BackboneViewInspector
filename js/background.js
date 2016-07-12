/**
 * Created by KGopi on 12/3/2015.
 */

var isActive = false;
var viewCountArray = {};


var BVT = {
    getPath: function(imageFile){
        return {
            "16":	"images/16/" + imageFile,
            "19":	"images/19/" + imageFile,
            "48":	"images/48/" + imageFile
        };
    },
    enable: function(tabId){
        chrome.tabs.sendMessage(tabId, {action: "ON_TRACKER"}, function(response) {});
        chrome.browserAction.setIcon({path: BVT.getPath("active.png")});
        chrome.tabs.sendMessage(tabId, {action: "SEND_VIEW_COUNT"}, function(response) {});
        isActive = true;
    },
    disable: function(tabId){
        chrome.tabs.sendMessage(tabId, {action: "OFF_TRACKER"}, function(response) {});
        chrome.browserAction.setIcon({path: BVT.getPath("inactive.png")});
        chrome.browserAction.setBadgeText({text: "", tabId: tabId});
        isActive = false;
    },
    toggleState: function(tabId){
        typeof  tabId === "number" || (tabId = tabId.id);
        isActive ? BVT.disable(tabId) : BVT.enable(tabId); // toggle
    },
    initTracker: function(tabId){
        if(isActive){
            chrome.tabs.sendMessage(tabId, {action: "ON_TRACKER"}, function(response) {});
            chrome.tabs.sendMessage(tabId, {action: "SEND_VIEW_COUNT"}, function(response) {});
        }else{
            chrome.tabs.sendMessage(tabId, {action: "OFF_TRACKER"}, function(response) {});
            chrome.browserAction.setBadgeText({text: "", tabId: tabId});
        }
    }
};

// Events
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        //chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
        // Re-populate array
        var count = 0;
        var _viewCountArray = viewCountArray[sender.tab.id];
        for(var key in request.data){
            _viewCountArray[key] = request.data[key];
        }
        // Recalculate data
        for(var i in _viewCountArray) {
            count += _viewCountArray[i];
        }
        isActive && chrome.browserAction.setBadgeText({text: count+"", tabId: sender.tab.id});
    }
);
chrome.tabs.onCreated.addListener(function(tab){
    viewCountArray[tab] = {};
    BVT.initTracker(tab);
});
chrome.tabs.onUpdated.addListener(function(tab){
    viewCountArray[tab] = {};
    BVT.initTracker(tab);
});
chrome.tabs.onActivated.addListener(function(tab){
    BVT.initTracker(tab.tabId);
});
chrome.browserAction.onClicked.addListener(BVT.toggleState);