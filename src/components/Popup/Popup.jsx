import { render, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";

// Popup component styling.
import "./popup.scss";

/**
 * The Spotify Friend Activity extension's popup.
 *
 * @returns {JSX.Element} The popup.
 */
const Popup = () => {
  // Keep track of the FriendActivity component's display state.
  const [isDisplayed, setIsDisplayed] = useState();

  useEffect(() => {
    // Get isDisplayed from chrome local storage.
    chrome.storage.sync.get("isDisplayed", (store) => {
      // If isDisplayed has never been set. (The user hasn't clicked the "Show friend activity" toggle yet)
      if (store.isDisplayed === undefined) {
        setIsDisplayed(true);
      } else {
        setIsDisplayed(store.isDisplayed);
      }
    });
  }, []);

  // "Show friend activity" toggle handler.
  const handleToggleChange = (e) => {
    const isDisplayed = e.target.checked;

    // Set isDisplayed in chrome local storage.
    chrome.storage.sync.set({ isDisplayed });

    setIsDisplayed(isDisplayed);
  };

  return (
    <Fragment>
      <h1>Spotify Friend Activity</h1>
      {isDisplayed !== undefined && (
        <label class="switch">
          <input
            type="checkbox"
            id="friend-activity-toggle"
            checked={isDisplayed}
            onChange={handleToggleChange}
          />
          <span class="slider">
            <span class="switch-label">Show friend activity</span>
          </span>
        </label>
      )}
      <p>If you run into an issue, try refreshing the page.</p>
      <p>
        If the issue persists, please report it{" "}
        <a
          href="https://github.com/jackweatherford/spotify-friend-activity/issues"
          target="_blank"
        >
          here
        </a>
        .
      </p>
      <div class="footer-icons-container">
        <a
          href="https://github.com/jackweatherford/spotify-friend-activity"
          target="_blank"
        >
          <img width={24} height={24} src="../../images/github.png" />
        </a>
        <a
          href="https://chrome.google.com/webstore/detail/spotify-friend-activity/amlnlcdighbhfciijpnofbpphfnkmeaa"
          target="_blank"
        >
          <img width={24} height={21} src="../../images/chrome-web-store.png" />
        </a>
      </div>
    </Fragment>
  );
};

// Inject Popup into popup.html.
render(<Popup />, document.getElementById("popup"));
