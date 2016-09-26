/*global chrome*/
var ts = function() { return new Date().toISOString().substring(11); }
console.log(ts(), "initializeHook from content script");
var initializeHook = function(window) {
  window.__MEIOSIS_TRACER_DEVTOOLS_GLOBAL_HOOK__ = true;
};

var js = ";(" + initializeHook.toString() + "(window))";

var script = document.createElement("script");
script.textContent = js;
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);
console.log(ts(), "- done");

var sendObjectToDevTools = function(message) {
  chrome.extension.sendMessage(message);
};

window.addEventListener("message", function(evt) {
  console.log(ts(), "received message from app window");
  if (evt.source != window) {
    console.log(ts(), "- from another source");
    return;
  }
  if (evt.data.type === "MEIOSIS_RECEIVE") {
    sendObjectToDevTools({data: evt.data});
  }
  else if (evt.data.type === "MEIOSIS_INITIAL_MODEL") {
    sendObjectToDevTools({data: evt.data});
  }
});

chrome.runtime.onMessage.addListener(function(message) {
  if (message.content.type === "MEIOSIS_REQUEST_INITIAL_MODEL") {
    window.postMessage({ type: "MEIOSIS_REQUEST_INITIAL_MODEL" }, "*");
  }
  else if (message.content.type === "MEIOSIS_RENDER_ROOT") {
    window.postMessage({ type: "MEIOSIS_RENDER_ROOT", model: message.content.model }, "*");
  }
});
