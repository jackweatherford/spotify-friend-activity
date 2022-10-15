# Spotify Friend Activity

Firefox Add-on to view your friends' activity in Spotify's web player.

## Add to Firefox (latest release)

Add the Add-on to your browser from the Firefox Add-ons Page (Coming soon).

## Or build it yourself (latest dev build)

### 1. Global Setup

1. Open a command-line interface. (e.g., Terminal, Command Prompt, Git Bash, etc.)

2. Ensure that you are using the latest LTS version of [Node](https://nodejs.org/en/download/).

### 2. Project Setup

1. Run `git clone https://github.com/jackweatherford/spotify-friend-activity.git -b firefox`

2. Run `cd spotify-friend-activity`

3. Run `npm install`

4. Run `npm run build`

### 3. Firefox Setup

1. If you already installed Spotify Friend Activity from the Firefox Add-ons Page, you must temporarily disable it by clicking on the toggle to the right of the Spotify Friend Activity card in [about:addons](about:addons)

2. Open Firefox and navigate to [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox)

3. Click on `Load Temporary Add-on...`. (Top right button)

4. Select the `manifest.json` file within the `dist` folder that `npm run build` generated.

5. Navigate to [https://open.spotify.com/](https://open.spotify.com/) to verify that the extension is working.

6. To test any changes you've made to your code: re-run `npm run build`, wait for it to finish building, then click the `Reload` button at the bottom right of the Spotify Friend Activity card in [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox)

## Credits

Made with [preact-chrome-extension-starter](https://github.com/andrewctate/preact-chrome-extension-starter) and [spotify-buddylist](https://github.com/valeriangalliat/spotify-buddylist).
