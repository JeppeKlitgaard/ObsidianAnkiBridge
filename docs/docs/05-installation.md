# 💿 Installation

To get set up with **AnkiBridge** you will need to do the following:

1. Install the **Obsididan** plugin via **one** of the three methods described in [Plugin Installation](#plugin-installation) below
2. Install the **AnkiConnect** plugin in **Anki** and set it up as described in [Installing AnkiConnect](#installing-ankiconnect)

## Plugin installation
### Method 1: Community Plugins (recommended)

Install this plugin via the Obsidian Community Plugin interface

You can activate this plugin within Obsidian by doing the following:

1. Open Settings > Third-party plugin
2. Make sure Safe mode is off
3. Click Browse community plugins
4. Search for "**AnkiBridge**"
5. Click Install
6. Once installed, close the community plugins window and activate the newly installed plugin

### Method 2: BRAT

If you have [Obsidian BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin installed you can install AnkiBridge by doing the following:

1. Open `Command Palette`
2. Select the `Obsidian42 - BRAT: Add a beta plugin for testing` command
3. Paste in `JeppeKlitgaard/ObsidianAnkiBridge` into the text field
4. Press `Add Plugin`
5. Activate the plugin now found under the `Settings → Community Plugins` menu

### Method 3: Manual Installation

Alternatively you can do a manual installation:

1. Download the latest `ObsidianAnkiBridge-X.Y.Z.zip` from GitHub releases.
2. Create a new folder named `ObsidianAnkiBridge`
3. Extract the files within the zip file into `ObsidianAnkiBridge` folder
4. Place the folder in your .obsidian/plugins directory
5. Reload plugins (the easiest way is just restarting Obsidian)
6. Activate the plugin as normal.

## Installing AnkiConnect

1. Install [AnkiConnect](https://ankiweb.net/shared/info/2055492159) in Anki
   1. Tools → Add-ons → Get Add-ons...
   2. Paste the code `2055492159` > OK
2. Press the `Setup` button within the **AnkiBridge** settings in Obsidian
   1. Press `YES` on the Anki pop-up

As an alternative to step 2 you can also paste the configuration below into 
the **AnkiConnect** configuration:

3. Select the plugin → Config → Paste the configuration [below](#ankiconnect-configuration)

### AnkiConnect Configuration

:::caution Other method is preferred

Using the other method described above is preferred, but this should work as
well.
:::

```json
{
    "apiKey": null,
    "apiLogPath": null,
    "webBindAddress": "127.0.0.1",
    "webBindPort": 8765,
    "webCorsOrigin": "http://localhost",
    "webCorsOriginList": [
        "http://localhost",
        "app://obsidian.md"
    ]
}
```
