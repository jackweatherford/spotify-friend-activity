// Needed for async/await.
import "regenerator-runtime/runtime";

import { render } from "preact";

// The column that displays your Spotify friends' activity.
import { FriendActivity } from "./components/FriendActivity";

/**
 * Toggles the FriendActivity component on or off depending on toggleOn.
 *
 * @param {bool} toggleOn Whether to toggle the FriendActivity on or off.
 */
const toggleFriendActivity = async (toggleOn) => {
  // Wait for topContainer (an existing Spotify DOM element) to render.
  const topContainer = await waitUntilRender("Root__top-container");
  topContainer.style["grid-template-areas"] =
    '"top-bar top-bar top-bar" "nav-bar main-view buddy-feed" "now-playing-bar now-playing-bar now-playing-bar"';

  // Get buddyFeed. (an existing Spotify DOM element)
  let buddyFeed = document.getElementsByClassName("Root__buddy-feed")[0];

  // If buddyFeed doesn't exist and FriendActivity needs to toggle on.
  if (!buddyFeed && toggleOn) {
    buddyFeed = document.createElement("div");
    buddyFeed.classList.add("Root__buddy-feed");

    // Add buddyFeed as a child of topContainer.
    topContainer.appendChild(buddyFeed);

    // Inject FriendActivity into buddyFeed.
    render(<FriendActivity />, buddyFeed);
  } else if (buddyFeed && !toggleOn) {
    // Else if buddyFeed exists and FriendActivity needs to toggle off.
    buddyFeed.remove();
  }
};

/**
 * Waits for an element with className to render.
 * Ref: https://stackoverflow.com/a/61511955.
 *
 * @param {string} className The class name of the element to wait for.
 * @returns {Promise} Promise object representing the found element.
 */
const waitUntilRender = (className) => {
  return new Promise((resolve) => {
    const element = document.getElementsByClassName(className)[0];
    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver(() => {
      const element = document.getElementsByClassName(className)[0];
      if (element) {
        resolve(element);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

// Initial display render.
const initDisplay = async () => {
  // Listener that calls toggleFriendActivity when isDisplayed changes.
  chrome.storage.onChanged.addListener((changes) => {
    if ("isDisplayed" in changes) {
      toggleFriendActivity(changes.isDisplayed.newValue);
    }
  });

  // Get isDisplayed from chrome local storage.
  chrome.storage.sync.get("isDisplayed", (store) => {
    // If isDisplayed has never been set. (The user hasn't clicked the "Show friend activity" toggle yet)
    if (store.isDisplayed === undefined) {
      toggleFriendActivity(true);
    } else {
      toggleFriendActivity(store.isDisplayed);
    }
  });

  // Wait for "Now Playing" footer (an existing Spotify DOM element) to render.
  const nowPlaying = await waitUntilRender("Root__now-playing-bar");

  // Update nowPlaying min-height if "Listening on..." banner is present.
  const updateNowPlayingMinHeight = (mutationList) => {
    // If "Listening on..." banner was just added.
    if (mutationList[0]?.addedNodes.length) {
      // Increase nowPlaying min-height to account for "Listening on..." banner's additional height.
      nowPlaying.style["min-height"] = "calc(715px - 100vh)";
    } else if (mutationList[0]?.removedNodes.length) {
      // Reset nowPlaying min-height.
      nowPlaying.style["min-height"] = "";
    }
  };

  // Bind updateNowPlayingMinHeight() to footer mutation event.
  const footerObserver = new MutationObserver(updateNowPlayingMinHeight);
  footerObserver.observe(document.querySelector("footer"), {
    childList: true,
  });
};

// If the document is already loaded.
if (document.readyState !== "loading") {
  initDisplay();
} else {
  // Else wait for the document to load.
  document.addEventListener("DOMContentLoaded", () => {
    initDisplay();
  });
}
