# Obsidian AnkiBridge

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/JeppeKlitgaard/ObsidianAnkiBridge?style=for-the-badge&sort=semver)](https://github.com/JeppeKlitgaard/ObsidianAnkiBridge/releases/latest)
![GitHub All Releases](https://img.shields.io/github/downloads/JeppeKlitgaard/ObsidianAnkiBridge/total?style=for-the-badge)

Anki integration for [Obsidian](https://obsidian.md/).

This projected started as a fork of [Alex Colucci](https://github.com/reuseman) excellent `Flashcards` plugin,
but has significantly diverged from the original version in its design.

It has also been inspired by the `Obsidian_to_Anki` project by [Rubaiyat Khondaker](https://github.com/Pseudonium).

Both of these projects are worthwhile alternatives to AnkiBridge if the approach of this project isn't to your liking.

## Features

While AnkiBridge is still under active development, it already has a few handy
features and is in use by me personally.
### 📘 Blueprints

Parsing is done using 'blueprints' allowing for easy customisation and extension.

Unlike other projects AnkiBridge uses a powerful PEG parser instead of a `regex` approach.  
This makes parsing easier to debug and should make it very extensible too.

Directly in the Obsidian Vault you can specify:
- Anki Tags
- Anki Deck
- Anki Model to use (experimental)

Currently implemented blueprints:
- 🥪 Sandwich Card with #anki/start, #anki/---, #anki/end

### 📊 Rendering
- 🧮 Math rendering
- ⬇ Standard Markdown rendering

### 🧠 Intuitive usage

AnkiBridge should be intuitive to use and its codebase should be clean and free
of too many tricks.

### 🔏 Never lose data

Data is always stored in Obsidian and the syncing is just one-way. 
If a note is updated or changed in Obsidian, it will be reflected in Anki after
the next sync.

You can still have flashcards that only exist in Anki.

This means that your Obsidian vault represents the truth and your Anki decks 
are always update to reflect the vault perfectly.

- 🚮 Delete notes from Obsidian via the `delete: true` key
- ➡ Automatically moves cards to appropriate deck
- 🤖 Automatically updates tags and field content when syncing 


__Note: AnkiBridge considers the Obsidian Vault to be the 'ground truth'. Any
changes to bridged notes in Anki will be reverted upon sync.__

## Upcoming features

- Improved error handling when Anki is not available
- Stop cluttering `console`
- 🔗 Link rendering (with Obsidian URI support)
- 🖼 Image rendering
- 👩‍💻 Code syntax highlighting
- 🔉 Audio rendering
- 📹 Video rendering
- 🌉 Syncing of Mathjax preamples (advanced feature)
- 📦 Improved installation
- 📦 Available through Community Plugins
- ⚓ Linking to source from Anki

## How to install

1. Install this plugin on Obsidian (__NOTE: NOT YET AVAILABLE THROUGH COMMUNITY PLUGINS WINDOW. USE ALTERNATIVE INSTALLATION FOR NOW__)

    From Obsidian v0.9.8+, you can activate this plugin within Obsidian by doing the following:

    - Open Settings > Third-party plugin
    - Make sure Safe mode is off
    - Click Browse community plugins
    - Search for "**AnkiBridge**"
    - Click Install
    - Once installed, close the community plugins window and activate the newly installed plugin

    Alternatively you can do a manual installation:
    
    - Download the latest `main.js` & `mainfest.json` from releases.
    - Create a new folder named `AnkiBridge`
    - Place the files in the folder
    - Place the folder in your .obsidian/plugins directory
    - Reload plugins (the easiest way is just restarting Obsidian)
    - Activate the plugin as normal.

2. Install [AnkiConnect](https://ankiweb.net/shared/info/2055492159) on Anki

   - Tools > Add-ons -> Get Add-ons...
   - Paste the code **2055492159** > Ok
   - Select the plugin > Config > Paste the configuration below

### AnkiConnect Configuration

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
