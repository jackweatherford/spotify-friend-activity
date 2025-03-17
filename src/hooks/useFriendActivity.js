import { useState, useEffect } from "preact/hooks";

import { useInterval } from "./useInterval";

// Spotify API endpoint for fetching friend activity.
const BUDDYLIST_ENDPOINT =
  "https://guc-spclient.spotify.com/presence-view/v1/buddylist";

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

  // Setup Spotify API access token and fetch activity on first render.
  useEffect(() => {
    refetch();
  }, []);

  // Poll the API every minute without showing loading spinner.
  useInterval(() => {
    refetch({ updateLoadingState: false });
  }, 60000);

  // Fetch Spotify API access token.
  const fetchAccessToken = async () => {
    try {
      // Get accessToken from browser local storage.
      const response = await browser.storage.sync.get("accessToken");
      return response.accessToken;
    } catch (e) {
      console.log("[ERROR] [Spotify Friend Activity]", e);
      setErrors((oldErrors) => [...oldErrors, e]);
    }
  };

  // Fetch and update friend activity state.
  const fetchFriendActivity = async (accessToken) => {
    // Get Spotify friend activity.
    let friendActivity;
    try {
      const res = await fetch(BUDDYLIST_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      friendActivity = await res.json();
    } catch (e) {
      console.log(
        "[ERROR] [Spotify Friend Activity] Not logged in to Spotify - couldn't fetch Spotify friend activity"
      );
      setErrors((oldErrors) => [...oldErrors, e]);
    }

    // Update friend activity state.
    setFriendActivity(
      friendActivity?.friends
        ? friendActivity.friends.sort((a, b) =>
            a.timestamp < b.timestamp ? 1 : -1
          )
        : []
    );
  };

  // Simple refetch function that refetches data and updates loading state accordingly.
  const refetch = async (refetchOptions = { updateLoadingState: true }) => {
    if (refetchOptions.updateLoadingState) {
      setLoading(true);
    }

    const accessToken = await fetchAccessToken();
    await fetchFriendActivity(accessToken);

    if (refetchOptions.updateLoadingState) {
      setLoading(false);
    }
  };

  return { friendActivity, loading, errors, refetch };
};
