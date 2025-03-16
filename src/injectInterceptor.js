// Inject sfaInterceptor.js on document start.
const scriptElement = document.createElement("script");
scriptElement.src = chrome.runtime.getURL("sfaInterceptor.js");
scriptElement.onload = function () {
  this.remove();
};

(document.head || document.documentElement).appendChild(scriptElement);
