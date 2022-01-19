# 📃 Notes

In Obsidian, your notes are simply the [Blueprint](/blueprints)-formatted text
in your Obsidian documents.

These will be found by **AnkiBridge** and synchonised to Anki.

The Obsidian notes can also contain **note configurations**, typically written
in the [YAML](https://yaml.org/) language, just like the Obsidian frontmatter.

## Configuration

The available configuration options are:

| Option    | Type            | Default                          | Comment                                                 |
| --------- | --------------- | -------------------------------- | ------------------------------------------------------- |
| `id`      | `number ∣ null` | `null`                           | The Anki note ID. This is usually managed by AnkiBridge |
| `deck`    | `string`        | Defined in [settings](/settings) | The Anki deck to sync this note to                      |
| `tags`    | `Array<string>` | `[]`                             | A list of tags to apply to the note in Anki             |
| `delete`  | `boolean`       | `false`                          | Whether to delete the note in Anki on the               |
| `enabled` | `boolean`       | `true`                           | Whether to sync this note                               |
| `cloze`   | `boolean`       | `true`                           | Whether to enable cloze-deletion for this note          |

## Synchronisation

If you change any of the configurations above, **AnkiBridge** will automatically
reflect those changes in Anki after the next synchronisation.