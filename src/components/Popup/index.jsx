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
      <hr />
      <div class="issue-links">
        <a
          href="https://github.com/jackweatherford/spotify-friend-activity/issues/new?assignees=jackweatherford&labels=bug&template=bug_report.md&title=%5BBUG%5D"
          target="_blank"
          title="Report a Bug"
        >
          Report a Bug
        </a>
        <p> | </p>
        <a
          href="https://github.com/jackweatherford/spotify-friend-activity/issues/new?assignees=jackweatherford&labels=enhancement&template=feature_request.md&title=%5BENHANCEMENT%5D"
          target="_blank"
          title="Request a Feature"
        >
          Request a Feature
        </a>
      </div>
      <hr />
      <div class="footer-icons-container">
        <a
          href="https://github.com/jackweatherford/spotify-friend-activity"
          target="_blank"
          title="GitHub Repository"
        >
          <img
            width={24}
            height={24}
            src="../../images/github.png"
            alt="GitHub Icon"
          />
        </a>
        <a
          href="https://chrome.google.com/webstore/detail/spotify-friend-activity/amlnlcdighbhfciijpnofbpphfnkmeaa"
          target="_blank"
          title="Chrome Web Store Page"
        >
          <img
            width={24}
            height={21}
            src="../../images/chrome-web-store.png"
            alt="Chrome Web Store Icon"
          />
        </a>
      </div>
    </Fragment>
  );
};

// Inject Popup into popup.html.
render(<Popup />, document.getElementById("popup"));
