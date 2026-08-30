import {
  RefreshIcon,
  UserIcon,
  EqualizerIcon,
  PlaylistIcon,
  AlbumIcon,
  ArtistIcon,
} from "../Icons";
import { useEffect, useRef, useState } from "preact/hooks";

import { useFriendActivity } from "../../hooks/useFriendActivity";

// FriendActivity component styling.
import "./friendActivity.scss";

/**
 * Returns a formatted version of the time parameter.
 *
 * @param {number} time The amount of time in seconds.
 * @return {string} Time after formatting.
 */
const formatTime = (time) => {
  const durations = [
    { unit: "min", value: 60 },
    { unit: "hr", value: 60 },
    { unit: "d", value: 24 },
    { unit: "w", value: 7 },
  ];

  // Determine the most applicable unit of time.
  for (let i = 0; i < durations.length - 1; i++) {
    const duration = durations[i];
    time = Math.round(time / duration.value);

    if (time < durations[i + 1].value) {
      return `${time} ${duration.unit}`;
    }
  }

  const lastDuration = durations[durations.length - 1];
  time = Math.round(time / lastDuration.value);

  return `${time} ${lastDuration.unit}`;
};

/**
 * The column that displays your Spotify friends' activity.
 *
 * @returns {JSX.Element} Friend activity column.
 */
export const FriendActivity = () => {
  const { friendActivity, loading, refetch } = useFriendActivity();
  const [panelWidth, setPanelWidth] = useState(270);
  const [expandOnHover, setExpandOnHover] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedPanelWidth, setExpandedPanelWidth] = useState(270);
  const friendActivityContainerRef = useRef(null);
  const panelWidthRef = useRef(270);
  const expandedPanelWidthRef = useRef(270);
  const isCollapsedRef = useRef(false);

  useEffect(() => {
    chrome.storage.sync.get(
      [
        "friendActivityWidth",
        "friendActivityExpandedWidth",
        "friendActivityCollapsed",
        "expandFriendActivityOnHover",
      ],
      (store) => {
        if (typeof store.friendActivityWidth === "number") {
          const savedWidth =
            store.friendActivityWidth > 74
              ? store.friendActivityWidth
              : store.friendActivityExpandedWidth || 270;

          panelWidthRef.current = savedWidth;
          setPanelWidth(savedWidth);
        }

        if (typeof store.friendActivityExpandedWidth === "number") {
          expandedPanelWidthRef.current = store.friendActivityExpandedWidth;
          setExpandedPanelWidth(store.friendActivityExpandedWidth);
        }

        setExpandOnHover(store.expandFriendActivityOnHover === true);
        setIsCollapsed(
          store.friendActivityCollapsed === undefined
            ? store.expandFriendActivityOnHover === true ||
              store.friendActivityWidth <= 74
            : store.friendActivityCollapsed === true,
        );
      },
    );

    const handleStorageChange = (changes, areaName) => {
      if (areaName === "sync" && "expandFriendActivityOnHover" in changes) {
        const shouldExpandOnHover =
          changes.expandFriendActivityOnHover.newValue === true;

        setExpandOnHover(shouldExpandOnHover);
        setIsCollapsed(shouldExpandOnHover);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  useEffect(() => {
    const buddyFeed = friendActivityContainerRef.current?.parentElement;

    if (buddyFeed) {
      buddyFeed.style.width = `${panelWidth}px`;
      buddyFeed.style.setProperty(
        "--expanded-width",
        "220px",
      );
      buddyFeed.classList.toggle("expand-on-hover", isCollapsed);
    }

    panelWidthRef.current = panelWidth;
    isCollapsedRef.current = isCollapsed;
  }, [panelWidth, expandedPanelWidth, isCollapsed]);

  const handleResizeStart = (event) => {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = panelWidth;
    const minWidth = 74;

    if (isCollapsed) {
      setIsCollapsed(false);
    }

    const handleResize = (resizeEvent) => {
      const nextWidth = Math.max(
        minWidth,
        startWidth + startX - resizeEvent.clientX,
      );

      if (nextWidth > minWidth) {
        panelWidthRef.current = nextWidth;
        setPanelWidth(nextWidth);
        expandedPanelWidthRef.current = nextWidth;
        setExpandedPanelWidth(nextWidth);
        isCollapsedRef.current = false;
        setIsCollapsed(false);
      } else {
        isCollapsedRef.current = true;
        setIsCollapsed(true);
      }
    };

    const handleResizeEnd = () => {
      document.removeEventListener("pointermove", handleResize);
      document.removeEventListener("pointerup", handleResizeEnd);

      chrome.storage.sync.set({
        friendActivityWidth: panelWidthRef.current,
        friendActivityExpandedWidth: expandedPanelWidthRef.current,
        friendActivityCollapsed: isCollapsedRef.current,
      });
    };

    document.addEventListener("pointermove", handleResize);
    document.addEventListener("pointerup", handleResizeEnd, { once: true });
  };

  const handleCompactToggle = (event) => {
    if (event.target.closest("a, .resize-handle")) {
      return;
    }

    const nextCollapsedState = !isCollapsed;
    isCollapsedRef.current = nextCollapsedState;
    setIsCollapsed(nextCollapsedState);
    chrome.storage.sync.set({ friendActivityCollapsed: nextCollapsedState });
  };

  const handleRefetch = () => refetch();

  return (
    <div
      class="friend-activity-container"
      ref={friendActivityContainerRef}
      onClick={handleCompactToggle}
    >
      <div
        class="resize-handle"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize friend activity"
        onPointerDown={handleResizeStart}
      />
      <div class="sfa-header">
        <h1>Friend activity</h1>
        <div class="refresh" title="Refresh" onClick={handleRefetch}>
          <RefreshIcon />
        </div>
      </div>
      <div class="friends-list">
        {loading ? (
          <div class="loader-container">
            <div class="loader"></div>
          </div>
        ) : (
          friendActivity.map(({ user, track, timestamp }) => {
            // Seconds since friend's last activity.
            const seconds = Math.round((Date.now() - timestamp) / 1000);

            // Determine online status of friend.
            const online = seconds <= 300 ? true : false;

            // Get track ID.
            const trackID = track.uri.split(":").pop();

            // Get context type (playlist, album, or artist) and context ID.
            const contextURI = track.context.uri.split(":");
            const contextID = contextURI.pop();
            const contextType = contextURI.pop();

            // Context URL.
            const contextURL = `https://open.spotify.com/${contextType}/${contextID}`;

            // Track URL that highlights the track within its album if possible.
            const trackURL =
              contextType == "album"
                ? `${contextURL}?highlight=spotify:track:${trackID}`
                : `https://open.spotify.com/track/${trackID}`;

            return (
              <div class="friend">
                <a
                  class="sfa-user-icon-container"
                  title={`Play ${track.artist.name} ${track.name}`}
                  href={trackURL}
                  target="_blank"
                >
                  <UserIcon src={user.imageUrl} alt={user.name} />
                  <div class="user-play-icon" />
                </a>
                {online && (
                  <div class="online-badge-container" title="Online">
                    <div class="online-badge" />
                  </div>
                )}
                <div class="friend-info">
                  <div class="username-and-time">
                    <a
                      class="username"
                      title={user.name}
                      href={`https://open.spotify.com/user/${user.uri
                        .split(":")
                        .pop()}`}
                      target="_blank"
                    >
                      {user.name}
                    </a>
                    {online ? (
                      <EqualizerIcon title="Online" />
                    ) : (
                      <span
                        class="time"
                        title={`Last Active: ${new Date(
                          Math.round(timestamp / 60000) * 60000
                        ).toLocaleString([], {
                          year: "2-digit",
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`}
                      >
                        {formatTime(seconds)}
                      </span>
                    )}
                  </div>
                  <div class="track-and-artist">
                    <a
                      class="track-info"
                      title={track.name}
                      href={trackURL}
                      target="_blank"
                    >
                      {track.name}
                    </a>
                    <span class="bullet-separator"> • </span>
                    <a
                      class="track-info"
                      title={track.artist.name}
                      href={`https://open.spotify.com/artist/${track.artist.uri
                        .split(":")
                        .pop()}`}
                      target="_blank"
                    >
                      {track.artist.name}
                    </a>
                  </div>
                  <a
                    class="context-container"
                    title={track.context.name}
                    href={contextURL}
                    target="_blank"
                  >
                    {contextType == "playlist" ? (
                      <PlaylistIcon />
                    ) : contextType == "album" ? (
                      <AlbumIcon />
                    ) : (
                      <ArtistIcon />
                    )}
                    <span class="context-name">{track.context.name}</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
