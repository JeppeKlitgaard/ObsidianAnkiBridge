# Obsidian AnkiBridge

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/JeppeKlitgaard/ObsidianAnkiBridge?style=for-the-badge&sort=semver)](https://github.com/JeppeKlitgaard/ObsidianAnkiBridge/releases/latest)
![GitHub All Releases](https://img.shields.io/github/downloads/JeppeKlitgaard/ObsidianAnkiBridge/total?style=for-the-badge)

Anki integration for [Obsidian](https://obsidian.md/).

This projected started as a fork of [Alex Colucci](https://github.com/reuseman) excellent `Flashcards` plugin,
but has significantly diverged from the original version in its design.

It has also been inspired by the `Obsidian_to_Anki` project by [Rubaiyat Khondaker](https://github.com/Pseudonium).

Both of these projects are worthwhile alternatives to AnkiBridge if the approach of this project isn't to your liking.

## Features

🗃️ Simple flashcards with **#card**  
🎴 Reversed flashcards with **#card-reverse**  
📅 Spaced-only cards with **#card-spaced**  
✍️ Inline style with **Question::Answer**  
✍️ Inline style reversed with **Question:::Answer**  
🧠 **Context-aware** mode  
🏷️ Global and local **tags**  
🔢 Support for **LaTeX**  
🖼️ Support for **images**  
🔗 Support for **Obsidian URI**  
⚓ Support for **reference to note**  
📟 Support for **code syntax highlight**

## How it works?

The following is a demo where the three main operations are shown:

1. **Insertion** of cards;
2. **Update** of cards;
3. **Deletion** of cards.

![Demo image](docs/demo.gif)

## How to use it?

The wiki explains in detail [how to use it](https://github.com/reuseman/flashcards-obsidian/wiki).

## How to install

1. Install this plugin on Obsidian

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
