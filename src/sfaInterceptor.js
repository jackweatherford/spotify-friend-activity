// The endpoint that Spotify uses to get the access token.
const ACCESS_TOKEN_ENDPOINT = "https://open.spotify.com/get_access_token";

// Override the fetch function to intercept the Spotify API access token.
window.fetch = new Proxy(window.fetch, {
  apply: (target, that, args) => {
    // Call the original fetch function.
    const fetchOverride = target.apply(that, args);

    fetchOverride.then(async (res) => {
      // Only intercept the Spotify API access token.
      if (res.url.startsWith(ACCESS_TOKEN_ENDPOINT)) {
        const clonedResponse = res.clone();
        const resJson = await clonedResponse.json();
        const accessToken = resJson.accessToken;

        // Send the Spotify API access token to the extension.
        window.postMessage({ type: "ACCESS_TOKEN", accessToken });
      }
    });

    return fetchOverride;
  },
});
