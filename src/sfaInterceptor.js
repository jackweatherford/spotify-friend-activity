// Override the fetch function to intercept the Spotify API access token.
window.fetch = new Proxy(window.fetch, {
  apply: (target, that, args) => {
    // Call the original fetch function with no alterations.
    const fetchOverride = target.apply(that, args);

    // After the original fetch function is complete, check for Spotify API access token.
    fetchOverride.then(async () => {
      // Extract the authorization header from the request args.
      const authorizationHeader = args[1]?.headers?.authorization;

      // If the authorization header starts with "Bearer", it should also have the Spotify API access token.
      if (authorizationHeader?.startsWith("Bearer")) {
        // Send the Spotify API access token to the content script.
        window.postMessage({
          type: "ACCESS",
          token: authorizationHeader.split(" ")[1],
        });
      }
    });

    return fetchOverride;
  },
});
