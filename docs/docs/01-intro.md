---
slug: /
---

# 👋 AnkiBridge Introduction

**AnkiBridge** is a plugin for [Obsidian] that allows seamless integration
with the [Anki] spaced-repetition software.

You're **highly** encouraged to read through this documentation to get an
understanding of how **AnkiBridge** works and pit-falls to avoid.

:::danger Alpha Software

Please note that **AnkiBridge** is still in the alpha stage.
Polite feedback is much appreciated.

Once the features mentioned below in [Upcoming Features](#upcoming-features)
have all been implemented
AnkiBridge will enter a beta phase (versions `1.x.y`). 

**AnkiBridge does contain portions of code that modify files in your vault.
It could therefore delete data through a bug (though this _should_ never happen).
Having a recent backup of your data is _strongly_ encouraged.**

:::

## Features

While AnkiBridge is still under active development, it already has a few handy
features and is in use by me personally.
### 📘 Blueprints

Parsing is done using 'blueprints' allowing for easy customisation and extension.

Unlike other projects AnkiBridge uses a powerful `PEG` parser instead of a `regex` approach.  
This makes parsing easier to debug and should make it very extensible too.

Directly in the Obsidian Vault you can specify:
- Anki Tags
- Anki Deck

Currently implemented blueprints:
- 🥪 Sandwich Blueprint with `#anki/start`, `#anki/---`, `#anki/end`
- 💻 BasicCodeBlock Blueprint with `anki` codeblocks

### 📊 Rendering
- 🧮 Math rendering
- 🖼 Image rendering
- 🔉 Audio rendering
- 📹 Video rendering
- ❔ Cloze deletion
- ⬇ Standard Markdown rendering
- 🔗 Link rendering (with Obsidian URI support)
- ⚓ Linking to source from Anki

### 🧠 Intuitive usage

AnkiBridge should be intuitive to use and its codebase should be clean and free
of too many tricks.

### 🔧 Configurability

Many of the features mentioned above can be enabled and disabled using the
settings tab of the plugin.

### 🔏 Never lose data

Data is always stored in Obsidian and the syncing is just one-way. 
If a note is updated or changed in Obsidian, it will be reflected in Anki after
the next sync.

You can still have flashcards that only exist in Anki.

This means that your Obsidian vault represents the truth and your Anki decks 
are always update to reflect the vault perfectly.

- 🚮 Delete notes from Anki via the `delete: true` key
- ➡ Automatically moves cards to appropriate deck
- 🤖 Automatically updates tags and field content when syncing 

### 💪 Other features

- 🗃 Default deck matching
- 📂 Ignore folders
- 🏓 Ping connection
- 📦 Available through Community Plugins
- 🧪 Unit testing of blueprints

__Note: AnkiBridge considers the Obsidian Vault to be the 'ground truth'. Any
changes to bridged notes in Anki will be reverted upon sync.__

## Upcoming Features

- 👩‍💻 Code syntax highlighting
- 🌉 Syncing of Mathjax preamples (advanced feature)
- 📄 (More) Documentation
- 📘 More blueprints

[Obsidian]: https://obsidian.md/
[Anki]: https://apps.ankiweb.net/
