# ⚙ Processors

Processors add additional features to your notes before sending it to Anki.

Without them, you would just see the raw markdown text in your Anki notes!

You don't need to concern yourself too much with these – just enable the ones
that you think you need.

Those interested can read more below.

The available processors are:

| Processor | Type | Functionality |
| --------- | --- | --- |
| Debug | `pre`, `post` | Outputs additional debugging information into the console |
| Math | `pre` | Turns Latex math equations into the required format for Anki |
| Link | `post` | Turns Obsidian links into the proper URI-formatted links needed to access notes from Anki |
| Media | `post` | Fetches and uploads media content (image, audio, and video) to Anki |
| Cloze | `post` | Turns elements for which is has been configured into cloze deletion in Anki |
| LinkToSource | `post` | Adds a link to the Anki note that takes the user back to the source file in Obsidian |

## Preprocessors

Preprocessors are run sequentially on the raw Markdown text before the Markdown
is converted into HTML using Obsidian's own Markdown renderer.

## Postprocessors

Postprocessors on the other hand are run sequentially on the HTML DOM tree
after the text has been rendered into HTML by the Obsidian renderer.

The final HTML tree is converted into a string and sent to Anki.
