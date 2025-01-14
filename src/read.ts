import { type DirectoryJSON, memfs } from 'memfs';
import {
  fromJsonSnapshot,
  type JsonUint8Array,
  toJsonSnapshot,
} from 'memfs/lib/snapshot/json.js';
import { type SnapshotNode } from 'memfs/lib/snapshot/types.js';

import { type CreateSnapshotOptions, type FsApi } from './snapshot.js';

/**
 * Options for {@link readSnapshot}
 */
export type ReadSnapshotOptions = CreateSnapshotOptions;

/**
 * Type guard for determining what kind of JSON fixture we have.
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
 * Reads a snapshot into a filesystem
 *
 * @param snapshotJson Raw snapshot data in `DirectoryJSON` or Compact JSON format
 * @param options Options
 * @returns The value of `options.fs` or a new `memfs` `Volume`
 */
export async function readSnapshot(
  snapshotJson: Uint8Array,
  { dir = '/', fs }: ReadSnapshotOptions = {},
): Promise<FsApi> {
  await Promise.resolve();
  fs = fs ?? memfs().vol;

  let snapshot: JsonUint8Array<SnapshotNode>;

  if (isCompactJson(snapshotJson)) {
    snapshot = snapshotJson;
  } else {
    // no fromJSON in node:fs
    // TODO find a better way?
    const { vol } = memfs();
    const json = JSON.parse(snapshotJson.toString()) as DirectoryJSON;
    vol.fromJSON(json);
    snapshot = await toJsonSnapshot({ fs: vol.promises });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  await fromJsonSnapshot(snapshot, { fs: fs.promises as any, path: dir });
  return fs;
}
