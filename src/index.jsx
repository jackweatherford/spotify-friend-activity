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
  // Wait for the .Root__main-view div (an existing Spotify DOM element) to render.
  const mainView = await waitUntilRender(".Root__main-view");

  // Wait for the header[aria-label="Top bar and user menu"] (an existing Spotify DOM element) to render.
  const topBar = await waitUntilRender(
    'header[aria-label="Top bar and user menu"]'
  );

  // If FriendActivity needs to toggle on.
  if (toggleOn) {
    // Update mainView so that buddyFeed displays on the right side.
    mainView.style.setProperty("flex-direction", "row");

    const buddyFeed = document.createElement("div");
    buddyFeed.classList.add("Root__buddy-feed");

    // Add buddyFeed as a child of mainView.
    mainView.appendChild(buddyFeed);

    // Inject FriendActivity into buddyFeed.
    render(<FriendActivity />, buddyFeed);

    // Give more space to the right of the topBar for the buddyFeed to take up.
    topBar.style.setProperty("padding-right", "286px");
  } else {
    // Else FriendActivity needs to toggle off.
    const buddyFeed = document.getElementsByClassName("Root__buddy-feed")[0];

    if (buddyFeed) {
      // Clear custom styling - "flex-direction: column;" will revert back to "flex-direction: row;"
      mainView.style.removeProperty("flex-direction");

      // Remove the buddyFeed element from the DOM.
      buddyFeed.remove();

      // Clear custom styling - "padding-right: 286px;" will revert back to "padding-right: 24px;"
      topBar.style.removeProperty("padding-right");
    }
  }
};

/**
 * Waits for an element to render specified by query.
 * Ref: https://stackoverflow.com/a/61511955.
 *
 * @param {string} query The css selector of the element to wait for.
 * @returns {Promise} Promise object representing the found element.
 */
const waitUntilRender = (query) => {
  return new Promise((resolve) => {
    const element = document.querySelector(query);
    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(query);
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
