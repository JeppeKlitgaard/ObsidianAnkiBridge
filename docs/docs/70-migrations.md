# 🚦 Migrations

Since **AnkiBridge** is still in its relative infancy, breaking changes may
be introduced (though always compliant with [SemVer 2.0](https://semver.org/)).

This document will guide you through the changes you need to make to *migrate*
past a *breaking change*.

Please follow the instructions for each migration carefully to ensure you end up
with a working setup.

## Future migrations

In version `0.4.1` a migration tracker was introduced, which will allow `AnkiBridge` to
perform some migrations automatically in the future.

Whether a migration is automatic or manual is clearly sign-posted.

:::danger Updating _from_ `0.4.0` and before

If you are upgrading from `0.4.0` or a version prior to that the automatic
migration system will not work.

As soon as you update to version `0.4.1` or above, _future_ automatic migrations
will work.

:::

## Migrations

### `0.4.x ⟶ 0.5.x`

#### MANUAL: Change of configuration codeblock for [Sandwich Blueprint](/blueprints#-sandwich)

The configuration codeblock was changed from:
````md
```anki
deck: …
…
```
````

To:
````md
```anki-config
deck: …
…
```
````

This was done to accommodate the new [BasicCodeBlock Blueprint](/blueprints#-basiccodeblock).

Changing all of the code-blocks is easily done manually at the time of migration
by using a simple **search-and-replace**.

[VSCode](https://code.visualstudio.com/) may be preferable to using Obsidian to do this.
