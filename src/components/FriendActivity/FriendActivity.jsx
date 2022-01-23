import {
  RefreshIcon,
  UserIcon,
  EqualizerIcon,
  PlaylistIcon,
  AlbumIcon,
  ArtistIcon,
} from "../Icons/Icons";

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
      return time + " " + duration.unit;
    }
  }

  const lastDuration = durations[durations.length - 1];
  time = Math.round(time / lastDuration.value);

  return time + " " + lastDuration.unit;
};

/**
 * The column that displays your Spotify friends' activity.
 *
 * @returns {JSX.Element} Friend activity column.
 */
export const FriendActivity = () => {
  const { friendActivity, loading, refetch } = useFriendActivity();

  // TODO: Add resizer - something like this:
  // <div class="layout-resizer" style="z-index: 1;">
  //   <label class="hidden-visually">
  //     <input class="layout-resizer-input" type="range" min="120" max="380" step="10" value="270" />
  //   </label>
  // </div>

  return (
    <div class="friend-activity-container">
      <div class="header">
        <h4>Friend activity</h4>
        <div class="refresh" onClick={refetch}>
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

            // Determine which context type the track is in. (playlist, album, or artist)
            const contextType = track.context.uri.split(":")[1];

            return (
              <div class="friend">
                <a
                  class="user-icon-container"
                  title={"Play " + track.artist.name + " " + track.name}
                  href={
                    "https://open.spotify.com/track/" + track.uri.split(":")[2]
                  }
                >
                  <UserIcon src={user.imageUrl} />
                  <div class="user-play-icon" />
                </a>
                {online && (
                  <div class="online-badge-container" title={user.name}>
                    <div class="online-badge" />
                  </div>
                )}
                <div class="friend-info">
                  <div class="username-and-time">
                    <a
                      class="username"
                      title={user.name}
                      href={
                        "https://open.spotify.com/user/" +
                        user.uri.split(":")[2]
                      }
                    >
                      {user.name}
                    </a>
                    {online ? (
                      <EqualizerIcon />
                    ) : (
                      <span class="time">{formatTime(seconds)}</span>
                    )}
                  </div>
                  <div class="track-and-artist">
                    <a
                      class="track-info"
                      title={track.name}
                      href={
                        "https://open.spotify.com/track/" +
                        track.uri.split(":")[2]
                      }
                    >
                      {track.name}
                    </a>
                    <span class="bullet-separator"> • </span>
                    <a
                      class="track-info"
                      title={track.artist.name}
                      href={
                        "https://open.spotify.com/artist/" +
                        track.artist.uri.split(":")[2]
                      }
                    >
                      {track.artist.name}
                    </a>
                  </div>
                  <a
                    class="context-container"
                    title={track.context.name}
                    href={
                      "https://open.spotify.com/" +
                      contextType +
                      "/" +
                      track.context.uri.split(":")[2]
                    }
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