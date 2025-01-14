import nodeFs from 'node:fs';

import { readSnapshot, type ReadSnapshotOptions } from './read.js';

/**
 * Options for {@link exportSnapshot}
 */
export type ExportSnapshotOptions = Pick<ReadSnapshotOptions, 'dir'>;

/**
 * Exports a snapshot to the _real_ filesystem.
 *
 * @param snapshot Snapshot in binary format
 * @param options Options
 * @returns Filesystem object
 */
export async function exportSnapshot(
  snapshot: Uint8Array,
  { dir = process.cwd() }: ExportSnapshotOptions,
): Promise<void> {
  await nodeFs.promises.mkdir(dir, { recursive: true });
  await readSnapshot(snapshot, { dir, fs: nodeFs });
}
