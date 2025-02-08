# snapshot-fs

> Create a snapshot of a directory for use with `memfs`
>
> ![snapshot-fs logo](https://github.com/boneskull/snapshot-fs/raw/main/assets/logo-128.png)

## About

I wanted something to help convert directories of test fixtures on-disk to a format usable by an in-memory filesystem ([memfs][]).

To that end, the `snapshot-fs` package ships a CLI, `snapshot-fs`, which converts a directory tree to a [Compact JSON][], [CBOR][] or [DirectoryJSON][] snapshot for use with `memfs`.

## 🎁 _New in v5.0.0_

- The command-line options have changed; see [Usage](#usage) below.
- The default input/output format is now CJSON.
- CBOR snapshots are now supported.
- The `export` subcommand got a `--dry-run` flag.

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

Create memfs snapshot from filesystem

Commands:
  snapshot-fs create [dest]             Create memfs snapshot from filesystem
                                                                       [default]
  snapshot-fs export <snapshot> [dest]  Export a JSON snapshot to the filesystem

Output:
      --separator, --sep  Path separator
                                  [choices: "posix", "win32"] [default: "posix"]
  -f, --format            Snapshot format
                  [string] [choices: "cbor", "cjson", "json"] [default: "cjson"]

Positionals:
  dest  Path to output file

Input:
  -s, --source  File or directory to snapshot
                                         [string] [default: (current directory)]

Options:
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]

For more information, visit https://github.com/boneskull/snapshot-fs
```

When run without a subcommand, `create` will be invoked.

### `create` w/ [Compact JSON][] Snapshots

By default (as of v5.0.0), `snapshot-fs` will create a snapshot in [CJSON/Compact JSON][Compact JSON] format.

```sh
snapshot-fs --source /some/dir /path/to/output.json
```

This is equivalent to:

```sh
snapshot-fs create --source /some/dir /path/to/output.json --format=cjson
```

In your code, you can use the resulting file using `memfs` directly:

```ts
import { type JsonUint8Array, type SnapshotNode, fromJsonSnapshot } from 'memfs/lib/snapshot/index.js';
import { memfs } from 'memfs';

const data = (await readFile(
  '/path/to/output.json',
)) as unknown as JsonUint8Array<SnapshotNode>;

const {vol} = memfs()
await fromJsonSnapshot(data, fs: vol.promises);

console.log(vol.toTree());

// ... do your thing
```

...or you can use the `readCJSONSnapshot()` helper from `snapshot-fs`:

```ts
import type { JsonUint8Array, SnapshotNode } from 'memfs/lib/snapshot/index.js';
import { readCJSONSnapshot } from 'snapshot-fs';

const data = (await readFile(
  '/path/to/output.json',
)) as unknown as JsonUint8Array<SnapshotNode>;

const vol = await readCJSONSnapshot(data);

console.log(vol.toTree());
```

This is fast; `JSON.parse()` is never called!

(but we can get faster...)

### `create` w/ [CBOR][] Snapshots

Similar to the above, you can create a CBOR-formatted snapshot this way:

```sh
snapshot-fs --source /some/dir /path/to/output.json --format=cbor
```

In your code, you can use the resulting file using `memfs` directly:

```ts
import { type SnapshotNode, fromBinarySnapshot } from 'memfs/lib/snapshot/index.js';
import type { CborUint8Array } from '@jsonjoy.com/json-pack/lib/cbor/types.js';
import { memfs } from 'memfs';

const data = (await readFile(
  '/path/to/output.json',
)) as unknown as CborUint8Array<SnapshotNode>;

const {vol} = memfs()
await fromBinarySnapshot(data, fs: vol.promises);

console.log(vol.toTree());

// ... do your thing
```

...or you can use the `readCBORSnapshot()` helper from `snapshot-fs`:

```ts
import {
  type SnapshotNode,
  fromBinarySnapshot,
} from 'memfs/lib/snapshot/index.js';
import type { CborUint8Array } from '@jsonjoy.com/json-pack/lib/cbor/types.js';
import { readCBORSnapshot } from 'snapshot-fs';

const data = (await readFile(
  '/path/to/output.json',
)) as unknown as CborUint8Array<SnapshotNode>;

const vol = await readCBORSnapshot(data);

console.log(vol.toTree());
```

### `create` w/ `DirectoryJSON` Snapshots

> [!CAUTION]
>
> `DirectoryJSON` is somewhat lossy and should be avoided if you ever want to re-create snapshots on your _real_ filesystem (e.g., using [export](#export)). For a directory full of text files, this is fine; for anything else, use CJSON or CBOR.

```sh
snapshot-fs --source /some/dir /path/to/output.json --format=json
```

This can be read into a `memfs` `Volume` like so:

```js
import { readFile } from 'node:fs/promises';
import { memfs } from 'memfs';

const directoryJson = JSON.parse(
  await readFile('/path/to/output.json', 'utf8'),
);

const { vol } = memfs();
vol.fromJSON(directoryJson);
```

### `export`

This allows you to re-create a directory on the filesystem from a snapshot. Handy!

```text
snapshot-fs export <snapshot> [dest]

Export a JSON snapshot to the filesystem

Positionals:
  snapshot  Path to snapshot file (CBOR/CJSON/DirectoryJSON)          [required]
  dest      Destination directory           [default: Current working directory]

Output:
      --separator, --sep  Path separator
                                  [choices: "posix", "win32"] [default: "posix"]

Options:
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]
  -D, --dry-run  Print what would be written to the filesystem         [boolean]
  -f, --format   Snapshot format
                  [string] [choices: "cbor", "cjson", "json"] [default: "cjson"]
```

If you have a snapshot (either format) and you want to re-create snapshot on the filesystem, use the `export` subcommand:

```sh
snapshot-fs export /path/to/snapshot.json /path/to/output
```

The destination directory will be created if it doesn't exist.

> [!TIP]
>
> Use the `--dry-run` flag with `export` to see what would be written to the filesystem.

## API

Some potentially-useful stuff exported from `snapshot-fs`:

- `createSnapshot()`/`createDirectoryJSONSnapshot()`/`createCJSONSnapshot()`/`createCBORSNapshot()` - Create a JSON snapshot from a real or virtual FS
- `readSnapshot()`/`readDirectoryJSONSnapshot()`/`readCBORSnapshot()`/`readCJSONSnapshot()` - Read a snapshot from a file and load it into a real or virtual FS
- `exportSnapshot()` - Alias for `readSnapshot()` defaulting to the real FS

See the typings for more information.

## License

Copyright 2024 [Christopher Hiller](https://github.com/boneskull). Licensed Apache-2.0

[memfs]: https://npm.im/memfs
[Compact JSON]: https://jsonjoy.com/specs/compact-json
[CBOR]: https://en.wikipedia.org/wiki/CBOR
[DirectoryJSON]: https://github.com/streamich/memfs/blob/2c6a6ca55ad2e661f40e488fe5ea4087438bae0e/src/volume.ts#L196-L198
