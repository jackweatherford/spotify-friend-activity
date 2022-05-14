# Spotify Friend Activity

Google Chrome Extension to view your friends' activity in Spotify's web player.

## Add to Chrome (latest release)

Add the extension to your browser from the [Chrome Web Store](https://chrome.google.com/webstore/detail/spotify-friend-activity/amlnlcdighbhfciijpnofbpphfnkmeaa).

## Or build it yourself (latest dev build)

### 1. Global Setup

1. Open a command-line interface. (e.g., Terminal, Command Prompt, Git Bash, etc.)

2. Ensure that you are using the latest LTS version of [Node](https://nodejs.org/en/download/).

### 2. Project Setup

1. Run `git clone https://github.com/jackweatherford/spotify-friend-activity.git`

2. Run `cd spotify-friend-activity`

3. Run `npm install`

4. Run `npm run build`

### 3. Chrome Setup

1. Open Chrome and navigate to [chrome://extensions/](chrome://extensions/)

2. If you already installed Spotify Friend Activity from the Chrome Web Store, you must temporarily disable it by clicking on the toggle at the bottom right of the Spotify Friend Activity card in [chrome://extensions/](chrome://extensions/)

3. Enable `Developer Mode`. (Top right toggle)

4. Click on `Load unpacked`. (Top left button)

5. Select the `dist` folder that `npm run build` generated.

6. Navigate to [https://open.spotify.com/](https://open.spotify.com/) to verify that the extension is working.

7. To test any changes you've made to your code: re-run `npm run build`, wait for it to finish building, then click the refresh icon at the bottom of the Spotify Friend Activity card in [chrome://extensions/](chrome://extensions/)

## Credits

Made with [preact-chrome-extension-starter](https://github.com/andrewctate/preact-chrome-extension-starter) and [spotify-buddylist](https://github.com/valeriangalliat/spotify-buddylist).
