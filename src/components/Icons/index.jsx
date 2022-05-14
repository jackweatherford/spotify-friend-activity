/**
 * Icon for refreshing your Spotify friends' activity.
 *
 * @returns {JSX.Element} Refresh icon.
 */
export const RefreshIcon = () => {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 118.04 122.88"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#fff"
        stroke="#fff"
        stroke-width={3}
        d="M16.08,59.26A8,8,0,0,1,0,59.26a59,59,0,0,1,97.13-45V8a8,8,0,1,1,16.08,0V33.35a8,8,0,0,1-8,8L80.82,43.62a8,8,0,1,1-1.44-15.95l8-.73A43,43,0,0,0,16.08,59.26Zm22.77,19.6a8,8,0,0,1,1.44,16l-10.08.91A42.95,42.95,0,0,0,102,63.86a8,8,0,0,1,16.08,0A59,59,0,0,1,22.3,110v4.18a8,8,0,0,1-16.08,0V89.14h0a8,8,0,0,1,7.29-8l25.31-2.3Z"
      />
    </svg>
  );
};

/**
 * Icon for displaying a user's avatar.
 *
 * @param {object} props UserIcon properties.
 * @param {string} props.src User avatar source URI.
 * @param {string} props.alt User avatar alternate text.
 * @returns {JSX.Element} User icon.
 */
export const UserIcon = (props) => {
  const { src, alt } = props;

  return (
    <img
      class="user-icon"
      width={40}
      height={40}
      src={src || "https://i.imgur.com/6vi3ThF.png"}
      alt={alt}
    />
  );
};

/**
 * Display this icon when the user is listening to music.
 *
 * @param {object} props EqualizerIcon properties.
 * @param {string} props.title Tooltip that displays when the user hovers over the icon.
 * @returns {JSX.Element} Equalizer icon.
 */
export const EqualizerIcon = (props) => {
  const { title } = props;

  return (
    <div title={title}>
      <svg
        width={14}
        height={14}
        viewBox="0 0 14 14"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="none"
          stroke="#b3b3b3"
          stroke-width={2}
          d="M1 14V4m4 10V0m4 14v-4m4 4V7"
        />
      </svg>
    </div>
  );
};

/**
 * Display this icon when the user is listening to a playlist.
 *
 * @returns {JSX.Element} Playlist icon.
 */
export const PlaylistIcon = () => {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="none"
        stroke="#b3b3b3"
        stroke-width={2}
        d="M11 25a5 5 0 1 0-10 0 5 5 0 1 0 10 0V5l20-5v20a5 5 0 1 0-10 0 5 5 0 1 0 10 0"
      />
    </svg>
  );
};

/**
 * Display this icon when the user is listening to an album.
 *
 * @returns {JSX.Element} Album icon.
 */
export const AlbumIcon = () => {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 22 22"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle fill="none" stroke="#b3b3b3" cx={11} cy={11} r={10} />
      <path fill="none" stroke="#b3b3b3" d="M8 8h6v6H8z" />
    </svg>
  );
};

/**
 * Display this icon when the user is listening to an artist.
 *
 * @returns {JSX.Element} Artist icon.
 */
export const ArtistIcon = () => {
  return (
    <svg
      fill="#b3b3b3"
      width={12}
      height={13.3333}
      viewBox="0 0 18 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15.216 13.717 12 11.869a.492.492 0 0 1-.243-.348.496.496 0 0 1 .112-.41l1.311-1.537A5.498 5.498 0 0 0 14.5 6v-.5a5.524 5.524 0 0 0-1.739-4.014A5.46 5.46 0 0 0 8.636.011c-2.88.187-5.135 2.673-5.135 5.66V6c0 1.311.469 2.58 1.319 3.574l1.311 1.537a.49.49 0 0 1 .112.41.49.49 0 0 1-.244.348l-3.213 1.847A5.513 5.513 0 0 0 0 18.501V20h1v-1.499c0-1.616.874-3.116 2.283-3.917l3.215-1.848c.388-.223.654-.604.73-1.045a1.494 1.494 0 0 0-.337-1.229L5.579 8.925A4.505 4.505 0 0 1 4.499 6v-.329c0-2.461 1.845-4.509 4.2-4.662a4.468 4.468 0 0 1 3.377 1.206A4.461 4.461 0 0 1 13.5 5.5V6a4.5 4.5 0 0 1-1.08 2.925l-1.311 1.537a1.499 1.499 0 0 0 .394 2.274l3.218 1.849a4.513 4.513 0 0 1 2.28 3.916V20h1v-1.499a5.517 5.517 0 0 0-2.785-4.784Z" />
    </svg>
  );
};
