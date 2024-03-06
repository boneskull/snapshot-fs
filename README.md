# snapshot-fs

> Create a snapshot of a directory for use with `memfs`

## About

I wanted something to help convert directories of test fixtures on-disk to a format usable by an in-memory filesystem ([memfs][]).

To that end, the `snapshot-fs` package ships a CLI, `snapshot-fs`, which converts a directory tree to a `DirectoryJSON` object (or [JSON snapshot](https://github.com/streamich/memfs/blob/master/docs/snapshot/index.md)) for use with `memfs`.

## Install

**`snapshot-fs` requires Node.js v20.0.0 or newer.**

`snapshot-fs` can be run via `npx snapshot-fs` or installed globally via `npm install -g snapshot-fs`. Or however else you want to consume it.

`snapshot-fs` exports both CommonJS and ES modules.

## Usage

```text
  snapshot-fs [options..] <dir> [dest.json]

  Writes a DirectoryJSON object or snapshot
  (with --binary flag) to file. For use with memfs

  Options:

    --binary/-b     - Output memfs JSON snapshot
    --root/-r       - DirectoryJSON root (default: /)
    --help/-h       - Show this help message
```

If `dest.json` is not provided, the output will be written to `stdout`.

### Typical Example

```sh
snapshot-fs /some/dir /path/to/output.json
```

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

### Binary File Example

[memfs][]'s snapshots support binary files, but the `DirectoryJSON` format does not. If you need to support binary files, use the `--binary` flag. This creates a JSON _snapshot_ (for the curious, it's encoded as ["Compact JSON"](https://jsonjoy.com/specs/compact-json)) and must be consumed differently.

> [!NOTE] The resulting JSON is for machines.

```sh
snapshot-fs --binary /some/dir /path/to/output.json
```

```js
import { readFile } from 'node:fs/promises';
import { fromJsonSnapshot } from 'memfs/lib/snapshot/index.js';

/** @type {string} */
const snapshotJson = await readFile('/path/to/output.json', 'utf8');

/** @type {UInt8Array} */
const snapshot = new TextEncoder().encode(snapshotJson);

const { vol } = memfs();

// `fromJsonSnapshot` will populate the Volume at the root path /
// with the snapshot data
await fromJsonSnapshot(snapshot, { fs: vol.promises, path: '/' });
```

Alternatively, `snapshot-fs` exports `loadSnapshot()`, which does the equivalent of the above:

```js
import { readFile } from 'node:fs/promises';
import { loadSnapshot } from 'snapshot-fs';
import { type Volume } from 'memfs';

/** @type {string} */
const snapshotJson = await readFile('/path/to/output.json', 'utf8');

const vol: Volume = await loadSnapshot(snapshotJson);

// or, if you already have a Volume
const {vol: myVol} = memfs(); // <!-- your volume from elsewhere

// using a different root path
await loadSnapshot(snapshotJson, { fs: myVol, path: '/some/other/path' });

```

## License

Copyright 2024 [Christopher Hiller](https://github.com/boneskull). Licensed Apache-2.0

[memfs]: https://npm.im/memfs
