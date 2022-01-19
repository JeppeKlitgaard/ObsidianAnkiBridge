# 🔧 Settings

This page describes the settings that can be configured for **AnkiBridge** in Obsidian.

## 🧪 Test Connection

Pressing the `Test` button will try to connect to Anki and let you know whether
you have a working connection.

## ⚙ General Settings

| Option            | Description                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------- |
| Global tag        | This tag is applied to every note in Anki that originates from Obsidian                       |
| Folders to ignore | Any files in these folders will be ignored by AnkiBridge and their content will not be synced |

## 🃏 Default Deck Mapping

| Option        | Description                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Fallback deck | The default deck to put notes into                                                                                                |
| Deck map      | Files in the given folder will be put into the specified deck unless overridden in the [note configuration](/notes#configuration) |

## 🕸 Networking Settings

| Option              | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| AnkiConnect address | The address where AnkiConnect exposes its API                    |
| AnkiConnect port    | The port where AnkiConnect exposes its API                       |
| Periodic ping       | How often to ping Anki to check if the connection is still alive |

## 📘 Blueprint Settings

| Option | Description                                    |
| ------ | ---------------------------------------------- |
| …      | Each [blueprint](/blueprints) can be disabled or enabled here |

## ⚙ Processor Settings

| Option | Description                                    |
| ------ | ---------------------------------------------- |
| …      | Each [processor](/processors) can be disabled or enabled here |

## ⚙ Processor Configuration

Configuration options for processors. These are explained on the settings page.

## 🐛 Debugging Settings

Additional logging can be enabled here for debugging purposes.

It may be helpful to enable these when reporting an issue.
