import { useState, useEffect } from "preact/hooks";

import { useInterval } from "./useInterval";

// Spotify friend activity API.
// Ref: https://github.com/valeriangalliat/spotify-buddylist.
import { getWebAccessToken, getFriendActivity } from "spotify-buddylist";

// Cookie will be populated on Spotify user login.
let spDcCookie;

/**
 * @typedef {object} ReturnObject
 * @prop {object[]} friendActivity Resulting array of friends.
 * @prop {bool} loading Loading state of network requests.
 * @prop {object[]} error Any error states that were caught during the network requests.
 * @prop {function} refetch A function that can be called to refetch the data.
 */

/**
 * Hook that makes Spotify API requests to return friend activity data.
 *
 * @returns {ReturnObject} Data, loading state, error states, and refetch function.
 */
export const useFriendActivity = () => {
  const [friendActivity, setFriendActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [storedAccessToken, setStoredAccessToken] = useState("");

  // Setup Spotify API access token and fetch activity on first render.
  useEffect(async () => {
    const accessToken = await fetchAccessToken();
    refetch(accessToken);
  }, []);

  // Poll the API every minute.
  useInterval(() => {
    fetchFriendActivity();
  }, 60000);

  // Refresh access token every 29 minutes.
  useInterval(() => {
    fetchAccessToken();
  }, 1740000);

  // Fetch access token and update its state.
  const fetchAccessToken = async () => {
    // Get Spotify API access token.
    try {
      const response = await getWebAccessToken(spDcCookie);
      setStoredAccessToken(response.accessToken);
      return response.accessToken;
    } catch (e) {
      console.log("[ERROR] [Spotify Friend Activity]", e);
      setErrors((oldErrors) => [...oldErrors, e]);
    }
  };

  // Fetch and update state.
  const fetchFriendActivity = async (accessToken) => {
    // Get Spotify friend activity.
    let friendActivity;
    try {
      friendActivity = await getFriendActivity(
        accessToken || storedAccessToken
      );
    } catch (e) {
      console.log(
        "[ERROR] [Spotify Friend Activity] Not logged in to Spotify - couldn't fetch Spotify friend activity"
      );
      setErrors((oldErrors) => [...oldErrors, e]);
    }

    // Update state.
    setFriendActivity(
      friendActivity?.friends
        ? friendActivity.friends.sort((a, b) =>
            a.timestamp < b.timestamp ? 1 : -1
          )
        : []
    );
  };

  // Simple refetch function that refetches data and updates loading state accordingly.
  const refetch = async (accessToken) => {
    setLoading(true);
    await fetchFriendActivity(accessToken);
    setLoading(false);
  };

  return { friendActivity, loading, errors, refetch };
};

// API response shape (friendActivity):
// [
//   {
//     timestamp: {timestamp},
//     user: {
//       uri: "spotify:user:{user_id}",
//       name: "{user_name}",
//       imageUrl:
//         "https://i.scdn.co/image/{user_image_id}",
//     },
//     track: {
//       uri: "spotify:track:{track_id}",
//       name: "{track_name}",
//       imageUrl:
//         "http://i.scdn.co/image/{track_image_id}",
//       album: {
//         uri: "spotify:album:{album_id}",
//         name: "{album_name}",
//       },
//       artist: {
//         uri: "spotify:artist:{artist_id}",
//         name: "{artist_name}",
//       },
//       context: {
//         uri: "spotify:{context_type}:{context_id}",
//         name: "{context_name}",
//         index: {tack_index_within_context},
//       },
//     },
//   },
// ];
