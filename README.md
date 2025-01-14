# snapshot-fs

> Create a snapshot of a directory for use with `memfs`
>
> ![snapshot-fs logo](https://github.com/boneskull/snapshot-fs/raw/main/assets/logo-128.png)

## About

I wanted something to help convert directories of test fixtures on-disk to a format usable by an in-memory filesystem ([memfs][]).

To that end, the `snapshot-fs` package ships a CLI, `snapshot-fs`, which converts a directory tree to a `DirectoryJSON` object (or [_JSON snapshot_](https://github.com/streamich/memfs/blob/master/docs/snapshot/index.md)) for use with `memfs`.

## 🎁 _New in v2.0.0_

- The command-line options have changed; see [Usage](#usage) below.
- `snapshot-fs` can now re-create a directory on the filesystem from a _JSON snapshot_.
- `loadSnapshot()` is now `readSnapshot()`
- Export functionality exposed via `exportSnapshot()`

## Install

**`snapshot-fs` requires Node.js v22.13.0 or newer.**

`snapshot-fs` can be run via `npx snapshot-fs` or installed globally via `npm install -g snapshot-fs`. Or however else you want to consume it.

`snapshot-fs` exports both CommonJS and ES modules.

## Usage

```text
snapshot-fs [dest]

Create JSON snapshot of directory

Commands:
  snapshot-fs create [dest]             Create JSON snapshot of directory
                                                                       [default]
  snapshot-fs export <snapshot> [dest]  Export an existing snapshot to the files
                                        ystem

Positionals:
  dest  Output .json file; if omitted, written to stdout                [string]

Options:
      --version    Show version number                                 [boolean]
      --help       Show help                                           [boolean]
  -b, --binary     Output a memfs JSON snapshot instead of DirectoryJSON
                                                                       [boolean]
  -d, --dir        Directory to read from
                                   [string] [default: Current working directory]
  -r, --json-root  DirectoryJSON root                    [string] [default: "/"]

For more information, visit https://github.com/boneskull/snapshot-fs

```

When run without a subcommand, `create` will be invoked.

### `create` w/ `DirectoryJSON`

If you aren't working with binary files and your directories are small, `DirectoryJSON` is good enough.

```sh
snapshot-fs --dir /some/dir /path/to/output.json
```

or:

```sh
snapshot-fs create --dir /some/dir /path/to/output.json
```

In your code, you can use the resulting file:

```js
import { memfs } from 'memfs';
import { readFile } from 'node:fs/promises';

/** @type {import('memfs').DirectoryJSON} */
const directoryJson = await readFile('/path/to/output.json', 'utf8').then(
  JSON.parse,
);

const { vol } = memfs(directoryJson);

console.log(vol.toTree());

// ... do your thing
```

### `create` w/ JSON Snapshots

[memfs][]'s `DirectoryJSON` format doesn't support binary files. If you need to support binary files—or you're interested in re-exporting back to the filesystem later—use the `--binary` flag. This creates a JSON _snapshot_ (for the curious, it's encoded as ["Compact JSON"](https://jsonjoy.com/specs/compact-json)) and must be consumed differently.

> [!NOTE]
> The resulting JSON is for machines.

```sh
snapshot-fs create --binary --dir /some/dir /path/to/output.json
```

Here's an example of using the result:

```js
import { readFile } from 'node:fs/promises';
import { fromJsonSnapshot } from 'memfs/lib/snapshot/index.js';

/**
 * @import {SnapshotNode} from 'memfs/lib/snapshot/types.js';
 * @import {JsonUint8Array} from 'memfs/lib/snapshot/index.js';
 */

const snapshotJson = /** @type {JsonUint8Array<SnapshotNode>} */ (
  await readFile('/path/to/output.json') // read as a Buffer!
);

const { vol } = memfs();

// `fromJsonSnapshot` will populate the Volume at the root path /
// with the snapshot data
await fromJsonSnapshot(snapshot, { fs: vol.promises, path: '/' });
```

### `export`

This allows you to re-create a directory on the filesystem from a snapshot. Handy!

```text
snapshot-fs export <snapshot> [dest]

Export an existing snapshot to the filesystem

Positionals:
  snapshot  Path to snapshot .json file                      [string] [required]
  dest      Destination directory  [string] [default: Current working directory]

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

If you have a snapshot (either format) and you want to re-create snapshot on the filesystem, use the `export` subcommand:

```sh
snapshot-fs export /path/to/snapshot.json /path/to/output
```

The destination directory will be created if it doesn't exist.

Careful with this one!

## API

`snapshot-fs` exports both ESM and CJS modules.

Some potentially-useful stuff exported from `snapshot-fs`:

- `createSnapshot()` - Create a JSON snapshot from a real or virtual FS
- `createDirectoryJson()` - Create a `DirectoryJSON` object from a real or virtual FS; warns if a binary file is detected
- `readSnapshot()` - Read a snapshot from a file and load it into a real or virtual FS
- `exportSnapshot()` - Alias for `readSnapshot()` defaulting to the real FS
- `isCompactJson()` - Type guard to check if a `Uint8Array` is a Compact JSON snapshot

See the typings for more information.

## License

Copyright 2024 [Christopher Hiller](https://github.com/boneskull). Licensed Apache-2.0

[memfs]: https://npm.im/memfs
