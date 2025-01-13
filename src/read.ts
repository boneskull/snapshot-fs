import { memfs } from 'memfs';
import {
  fromJsonSnapshot,
  type JsonUint8Array,
} from 'memfs/lib/snapshot/json.js';
import { type SnapshotNode } from 'memfs/lib/snapshot/types.js';

import { type CreateSnapshotOptions, type FsApi } from './snapshot.js';

/**
 * Options for {@link readSnapshot}
 */
export interface ReadSnapshotOptions extends CreateSnapshotOptions {
  /**
   * Filesystem API
   */
  fs?: FsApi;
}

/**
 * Type guard for determining if some buffer is a compact JSON snapshot
 *
 * This is _very_ loose, but the main difference is that the "Compact JSON"
 * format is a JSON array and `DirectoryJSON` is an JSON object. Further, the
 * former is always "compact" (like the output of `JSON.stringify()` without
 * indents).
 *
 * @param value Value to test
 */
export const isCompactJson = (
  value: Uint8Array,
): value is JsonUint8Array<SnapshotNode> => {
  return ArrayBuffer.isView(value) && value.subarray(0, 1).toString() === '[';
};

/**
 * Reads a snapshot from string or `Uint8Array` into a filesystem.
 *
 * @param snapshotJson `Uint8Array` or `string` of a snapshot or `DirectoryJSON` object
 * @param opts Options
 * @returns {@link ReadSnapshotOptions.fs} or a new virtual filesystem
 */
export async function readSnapshot(
  snapshotJson: JsonUint8Array<SnapshotNode>,
  { dir = '/', fs }: ReadSnapshotOptions = {},
): Promise<FsApi> {
  fs = fs ?? memfs().vol;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  await fromJsonSnapshot(snapshotJson, { fs: fs?.promises as any, path: dir });
  return fs;
}
