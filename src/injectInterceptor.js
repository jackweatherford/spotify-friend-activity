// Inject sfaInterceptor.js on document start.
const scriptElement = document.createElement("script");
scriptElement.src = browser.runtime.getURL("sfaInterceptor.js");
scriptElement.onload = function () {
  this.remove();
};

(document.head || document.documentElement).appendChild(scriptElement);
