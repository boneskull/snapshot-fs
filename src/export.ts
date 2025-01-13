import { type JsonUint8Array } from 'memfs/lib/snapshot/json.js';
import { type SnapshotNode } from 'memfs/lib/snapshot/types.js';
import nodeFs from 'node:fs';

import { readSnapshot, type ReadSnapshotOptions } from './read.js';
import { type FsApi } from './snapshot.js';

/**
 * Options for {@link exportSnapshot}
 */
export type ExportSnapshotOptions = ReadSnapshotOptions;

/**
 * Exports a snapshot to the filesystem, using the _real_ filesystem by default.
 *
 * @param snapshotJson Snapshot in binary format
 * @param options Options
 * @returns Filesystem object
 */
export async function exportSnapshot(
  snapshotJson: JsonUint8Array<SnapshotNode>,
  { dir = process.cwd(), fs = nodeFs }: ExportSnapshotOptions,
): Promise<FsApi> {
  await fs.promises.mkdir(dir, { recursive: true });
  return readSnapshot(snapshotJson, { dir, fs });
}
