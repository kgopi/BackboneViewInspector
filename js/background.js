/**
 * Created by KGopi on 12/3/2015.
 */

var isActive = false;
var viewCountArray = {};
function toggleState(tabId){
    typeof  tabId === "number" || (tabId = tabId.id);
    if(isActive){
        chrome.tabs.sendMessage(tabId, {action: "OFF_TRACKER"}, function(response) {});
        isActive = false;
        chnageIcon(tabId);
    }
    else{
        chrome.tabs.sendMessage(tabId, {action: "ON_TRACKER"}, function(response) {});
        isActive = true;
        chnageIcon(tabId);
    }
}
function chnageIcon(tabId){
    chrome.browserAction.setIcon({path: isActive ? "images/Active.png" : "images/InActive.png"});
    isActive ? chrome.tabs.sendMessage(tabId, {action: "SEND_VIEW_COUNT"}, function(response) {})
        : chrome.browserAction.setBadgeText({text: "", tabId: tabId});
}
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
    toggleState(tab);
});
chrome.tabs.onUpdated.addListener(function(tab){
    viewCountArray[tab] = {};
    toggleState(tab);
});
chrome.browserAction.onClicked.addListener(toggleState);