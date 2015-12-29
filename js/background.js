/**
 * Created by KGopi on 12/3/2015.
 */

var isActive = false;
function toggleState(tab){
    if(isActive){
        chrome.tabs.sendMessage(tab.id, {action: "OFF_TRACKER"}, function(response) {});
        isActive = false;
        chnageIcon();
        // chrome.browserAction.setBadgeText({text: "10+"});
    }
    else{
        chrome.tabs.sendMessage(tab.id, {action: "ON_TRACKER"}, function(response) {});
        isActive = true;
        chnageIcon();
    }
}
function chnageIcon(){
    chrome.browserAction.setIcon({path: isActive ? "images/Active.png" : "images/InActive.png"});
}
chrome.browserAction.onClicked.addListener(toggleState);

