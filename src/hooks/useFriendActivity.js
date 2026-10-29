import { useState, useEffect } from "preact/hooks";

import { useInterval } from "./useInterval";

// Spotify API endpoint for fetching friend activity.
const LISTENING_ACTIVITY_ENDPOINT =
  "https://spclient.wg.spotify.com/listening-activity/v1/feed";

// Legacy friend activity endpoint. It omits users who limited who can see their
// listening activity and serves stale data, so it is only used as a fallback.
const BUDDYLIST_ENDPOINT =
  "https://guc-spclient.spotify.com/presence-view/v1/buddylist";

// Endpoints for looking up the names and images the listening activity feed leaves out.
const USER_PROFILE_ENDPOINT =
  "https://spclient.wg.spotify.com/user-profile-view/v3/profile";
const METADATA_ENDPOINT = "https://spclient.wg.spotify.com/metadata/4";
// The public Web API heavily rate limits the web player's token, so it is only
// used for playlist names, which the metadata endpoint doesn't serve.
const WEB_API_ENDPOINT = "https://api.spotify.com/v1";

// Metadata lookups by URI, shared across refetches. Holds promises so concurrent
// lookups of the same URI share one request.
const metadataCache = new Map();

// Time until which requests to a rate limited host are skipped, by host.
const rateLimitedUntil = new Map();

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Convert a base62 Spotify ID to the hex GID the metadata endpoint uses.
const idToGid = (id) => {
  let n = BigInt(0);
  for (const char of id) {
    n = n * BigInt(62) + BigInt(BASE62.indexOf(char));
  }
  return n.toString(16).padStart(32, "0");
};

// Convert a hex GID from the metadata endpoint back to a base62 Spotify ID.
const gidToId = (gid) => {
  let n = BigInt(`0x${gid}`);
  let id = "";
  while (n > 0) {
    id = BASE62[Number(n % BigInt(62))] + id;
    n = n / BigInt(62);
  }
  return id.padStart(22, "0");
};

/**
 * Makes an authorized request and returns the parsed JSON response.
 *
 * @param {string} url Request URL.
 * @param {string} accessToken Spotify API access token.
 * @param {object} options Extra fetch options.
 * @returns {Promise<object>} Parsed response body.
 */
const fetchJSON = async (url, accessToken, options = {}) => {
  const { host } = new URL(url);
  if (Date.now() < (rateLimitedUntil.get(host) || 0)) {
    throw new Error(`Skipping request to ${url} while ${host} is rate limited`);
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (res.status === 429) {
    const retryAfterSeconds = Number(res.headers.get("Retry-After")) || 60;
    rateLimitedUntil.set(host, Date.now() + retryAfterSeconds * 1000);
  }

  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }

  return res.json();
};

/**
 * Returns the cached result of load for key, calling load on a cache miss.
 * Failed lookups resolve to null and are not cached, so they are retried later.
 *
 * @param {string} key Cache key.
 * @param {function} load Function returning a promise of the value.
 * @returns {Promise<*>} The value, or null if the lookup failed.
 */
const cachedLookup = (key, load) => {
  if (!metadataCache.has(key)) {
    metadataCache.set(
      key,
      load().catch((e) => {
        metadataCache.delete(key);
        console.log("[ERROR] [Spotify Friend Activity] Lookup failed", key, e);
        return null;
      })
    );
  }

  return metadataCache.get(key);
};

// Look up a user's display name and avatar.
const lookupUser = (uri, accessToken) =>
  cachedLookup(uri, async () => {
    const id = uri.split(":").pop();
    const profile = await fetchJSON(
      `${USER_PROFILE_ENDPOINT}/${encodeURIComponent(id)}`,
      accessToken
    );
    return { name: profile.name || id, imageUrl: profile.image_url };
  });

// Look up a track, album, or artist on the metadata endpoint.
const fetchMetadata = (uri, accessToken) => {
  const [, type, id] = uri.split(":");
  return fetchJSON(
    `${METADATA_ENDPOINT}/${type}/${idToGid(id)}?market=from_token`,
    accessToken
  );
};

// Look up a track's name, first artist, and album.
const lookupTrack = (uri, accessToken) =>
  cachedLookup(uri, async () => {
    const track = await fetchMetadata(uri, accessToken);
    const [artist] = track.artist;
    return {
      name: track.name,
      artist: {
        uri: `spotify:artist:${gidToId(artist.gid)}`,
        name: artist.name,
      },
      album: {
        uri: `spotify:album:${gidToId(track.album.gid)}`,
        name: track.album.name,
      },
    };
  });

// Look up the name of the playlist, album, or artist a track was played from.
const lookupContextName = (uri, accessToken) =>
  cachedLookup(uri, async () => {
    const [, type, id] = uri.split(":");

    if (type !== "playlist") {
      return (await fetchMetadata(uri, accessToken)).name;
    }

    const playlist = await fetchJSON(
      `${WEB_API_ENDPOINT}/playlists/${id}?fields=name`,
      accessToken
    );
    return playlist.name;
  });

/**
 * Fetches the listening activity feed and fills in the names and images it omits.
 *
 * @param {string} accessToken Spotify API access token.
 * @returns {Promise<object[]>} Friends in the same shape as the legacy buddylist.
 */
const fetchListeningActivity = async (accessToken) => {
  const feed = await fetchJSON(LISTENING_ACTIVITY_ENDPOINT, accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unused: true, resultLimit: 100 }),
  });

  const friends = await Promise.all(
    (feed.entities || []).map(async (item) => {
      const entity = item.userEntity || item.followEntity;
      const activity = entity?.activity;

      // Skip users with no activity and non-track activity like podcast episodes.
      if (!activity?.entityUri?.startsWith("spotify:track:")) {
        return null;
      }

      const [user, track] = await Promise.all([
        lookupUser(entity.uri, accessToken),
        lookupTrack(activity.entityUri, accessToken),
      ]);

      if (!user || !track) {
        return null;
      }

      // Resolve where the track was played from, defaulting to its album.
      const contextUri = activity.contextUri || "";
      let context = track.album;
      if (contextUri.endsWith(":collection")) {
        context = { uri: "spotify:collection:tracks", name: "Liked Songs" };
      } else if (/^spotify:(playlist|album|artist):/.test(contextUri)) {
        const name = await lookupContextName(contextUri, accessToken);
        if (name) {
          context = { uri: contextUri, name };
        }
      }

      return {
        timestamp: Date.parse(activity.timestamp),
        isPlaying: activity.isPlaying === true,
        user: { uri: entity.uri, ...user },
        track: { uri: activity.entityUri, ...track, context },
      };
    })
  );

  return friends.filter(Boolean);
};

/**
 * Fetches the legacy buddylist.
 *
 * @param {string} accessToken Spotify API access token.
 * @returns {Promise<object[]>} Friends.
 */
const fetchBuddylist = async (accessToken) => {
  const buddylist = await fetchJSON(BUDDYLIST_ENDPOINT, accessToken);
  return buddylist.friends || [];
};

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

  // Fetch friend activity on first render.
  useEffect(() => {
    firstFetch();
  }, []);

  // Refetch friend activity every minute without showing loading spinner.
  useInterval(() => {
    refetch({ updateLoadingState: false });
  }, 60000);

  // Fetch Spotify API access token.
  const fetchAccessToken = async () => {
    try {
      // Get accessToken from browser local storage.
      const storage = await browser.storage.sync.get("accessToken");
      return storage.accessToken;
    } catch (e) {
      console.log("[ERROR] [Spotify Friend Activity]", e);
      setErrors((oldErrors) => [...oldErrors, e]);
    }
  };

  // Fetch and update friend activity state.
  const fetchFriendActivity = async (accessToken) => {
    // Get Spotify friend activity, falling back to the legacy buddylist.
    let friends;
    try {
      friends = await fetchListeningActivity(accessToken);
    } catch (e) {
      console.log(
        "[ERROR] [Spotify Friend Activity] Listening activity feed failed, falling back to buddylist",
        e
      );

      try {
        friends = await fetchBuddylist(accessToken);
      } catch (e) {
        // Expired token, rate limit, etc. - keep showing the last known list.
        console.log(
          "[ERROR] [Spotify Friend Activity] Couldn't fetch Spotify friend activity",
          e
        );
        setErrors((oldErrors) => [...oldErrors, e]);
        return;
      }
    }

    // Update friend activity state.
    setFriendActivity([...friends].sort((a, b) => b.timestamp - a.timestamp));
  };

  const firstFetch = async () => {
    setLoading(true);

    // Wait for Spotify API access token to be intercepted.
    let storage = await browser.storage.sync.get("accessToken");
    while (!storage.accessToken) {
      storage = await browser.storage.sync.get("accessToken");
    }

    refetch();
  };

  // Simple refetch function that refetches friend activity and updates loading state accordingly.
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
