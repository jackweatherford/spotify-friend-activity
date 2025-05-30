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
  // If FriendActivity needs to toggle on.
  if (toggleOn) {
    // Create the buddy-feed div that will be added to DOM.
    const buddyFeed = document.createElement("div");
    buddyFeed.classList.add("buddy-feed");

    // Wait for Spotify's main grid to render.
    const mainGrid = await waitUntilRender(
      "#main>div:first-of-type>div:nth-of-type(2)"
    );

    // Custom grid areas to add a buddy-feed grid-area.
    const newGridTemplateAreas =
      '"top-banner top-banner top-banner top-banner" "global-nav global-nav global-nav global-nav" "left-sidebar main-view right-sidebar buddy-feed" "now-playing-bar now-playing-bar now-playing-bar now-playing-bar"';

    // Update mainGrid's inline styles with the new grid-template-areas.
    mainGrid.setAttribute(
      "style",
      `${
        mainGrid.getAttribute("style") || ""
      } grid-template-areas: ${newGridTemplateAreas};`
    );

    // Add buddyFeed to the DOM.
    mainGrid.appendChild(buddyFeed);

    // Inject FriendActivity into buddyFeed.
    render(<FriendActivity />, buddyFeed);
  } else {
    // Else FriendActivity needs to toggle off.
    const buddyFeed = document.getElementsByClassName("buddy-feed")[0];

    if (buddyFeed) {
      // Remove the buddyFeed element from the DOM.
      buddyFeed.remove();

      // Wait for Spotify's main grid to render.
      const mainGrid = await waitUntilRender(
        "#main>div:first-of-type>div:nth-of-type(2)"
      );

      // Revert mainGrid's inline styles to remove the custom grid-template-areas.
      mainGrid.setAttribute(
        "style",
        mainGrid
          .getAttribute("style")
          .split(";")
          .filter((style) => !style.trim().startsWith('grid-template-areas: "'))
          .join(";")
      );
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

// Listen for message events from sfaInterceptor.js.
window.addEventListener("message", async (event) => {
  // If an access token was identified.
  if (event.data.type === "ACCESS") {
    // Get the access token incoming from the message event.
    const incomingAccessToken = event.data.token;
    // Get the access token currently stored in local storage.
    const storage = await chrome.storage.sync.get("accessToken");
    const currentAccessToken = storage.accessToken;

    // If the access tokens don't match, then the incoming access token is new.
    if (incomingAccessToken !== currentAccessToken) {
      await chrome.storage.sync.set({ accessToken: incomingAccessToken });
    }
  }
});

// If the document is already loaded.
if (document.readyState !== "loading") {
  initDisplay();
} else {
  // Else wait for the document to load.
  document.addEventListener("DOMContentLoaded", () => {
    initDisplay();
  });
}
