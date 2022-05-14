import {
  RefreshIcon,
  UserIcon,
  EqualizerIcon,
  PlaylistIcon,
  AlbumIcon,
  ArtistIcon,
} from "../Icons";

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

  return (
    <div class="friend-activity-container">
      <div class="header">
        <h1>Friend activity</h1>
        <div class="refresh" title="Refresh" onClick={refetch}>
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
                  class="user-icon-container"
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
