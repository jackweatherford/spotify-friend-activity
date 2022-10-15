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
  // Wait for the .Root__top-container div (an existing Spotify DOM element) to render.
  const topContainer = await waitUntilRender("Root__top-container");

  // If FriendActivity needs to toggle on.
  if (toggleOn) {
    // Add a buddy-feed grid-area in the container grid.
    topContainer.style.setProperty(
      "grid-template-areas",
      '"top-bar top-bar top-bar" "nav-bar main-view buddy-feed" "now-playing-bar now-playing-bar now-playing-bar"'
    );

    const buddyFeed = document.createElement("div");
    buddyFeed.classList.add("Root__buddy-feed");

    // Add buddyFeed as a child of topContainer.
    topContainer.appendChild(buddyFeed);

    // Inject FriendActivity into buddyFeed.
    render(<FriendActivity />, buddyFeed);
  } else {
    // Else FriendActivity needs to toggle off.
    const buddyFeed = document.getElementsByClassName("Root__buddy-feed")[0];

    if (buddyFeed) {
      // Clear buddy-feed from the grid-area, will revert back to Spotify's grid.
      topContainer.style.removeProperty("grid-template-areas");

      // Remove the buddyFeed element from the DOM.
      buddyFeed.remove();
    }
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
  browser.storage.onChanged.addListener((changes) => {
    if ("isDisplayed" in changes) {
      toggleFriendActivity(changes.isDisplayed.newValue);
    }
  });

  // Get isDisplayed from browser local storage.
  browser.storage.sync.get("isDisplayed", (store) => {
    // If isDisplayed has never been set. (The user hasn't clicked the "Show friend activity" toggle yet)
    if (store?.isDisplayed === undefined) {
      toggleFriendActivity(true);
    } else {
      toggleFriendActivity(store.isDisplayed);
    }
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
