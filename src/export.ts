import { memfs } from 'memfs';
import { type Volume } from 'memfs/lib/volume.js';
import nodeFs from 'node:fs';
import { type sep } from 'node:path';

import {
  readSnapshot,
  type SnapshotForKind,
  type SnapshotKind,
} from './read.js';
import { type FsApi } from './snapshot.js';
import { toTree } from './tree.js';

/**
 * Options for functions in this module
 */
export interface ExportSnapshotOptions {
  /**
   * Destination directory
   */
  dest?: string;

  /**
   * If `true`, write to a virtual filesystem and dump a difflike tree
   */

  dryRun?: boolean;

  /**
   * Path separator in snapshot (?)
   */
  separator?: typeof sep;
}

const colorOverwrite = (str: string) => `\x1b[91m${str}\x1b[0m`;
const colorNew = (str: string) => `\x1b[92m${str}\x1b[0m`;

/**
 * Exports a snapshot to the _real_ filesystem.
 *
 * Creates the directory if it does not exist.
 *
 * @remarks
 * `memfs` sure makes "dry runs" easier, doesn't it?
 * @param kind Snapshot kind
 * @param data Snapshot data
 * @param options Options
 */
export async function exportSnapshot<
  K extends SnapshotKind,
  T extends SnapshotForKind<K>,
>(
  kind: K,
  data: T,
  { dest = process.cwd(), dryRun, separator }: ExportSnapshotOptions = {},
): Promise<void> {
  let vol: undefined | Volume;
  let fs: FsApi;
  if (dryRun) {
    ({ fs, vol } = memfs());
  } else {
    fs = nodeFs;
  }

  await fs.promises.mkdir(dest, { recursive: true });

  await readSnapshot(kind as any, data, { fs, separator, source: dest });

  if (dryRun) {
    const msg = `[INFO] Dry run!
       → Dest dir will be recursively created
       → All extant files will have permissions reset
       → Red or "!": Overwritten due to size mismatch
       → Green or "+": New files\n`;

    // FIXME: supports-color is ESM-only
    const supportsColor = await import('supports-color');
    const [formatOverwrite, formatNew] = supportsColor.default.stderr
      ? [colorOverwrite, colorNew]
      : [];

    console.error(msg);
    console.error(toTree(vol!, { formatNew, formatOverwrite, separator }));
  }
}
