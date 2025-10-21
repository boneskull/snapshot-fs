import { type DirectoryJSON, memfs } from 'memfs';
import {
  fromBinarySnapshot,
  fromJsonSnapshot,
  type JsonUint8Array,
  type SnapshotNode,
  toBinarySnapshot,
} from 'memfs/lib/snapshot/index.js';

import { type CreateSnapshotOptions, type FsApi } from './snapshot.js';
import { type CborUint8Array } from './types.js';

/**
 * Options for {@link readSnapshot}
 */
export type ReadSnapshotOptions = CreateSnapshotOptions;

/**
 * Get the type of snapshot data for a given snapshot kind
 * @template K Snapshot kind
 */
export type SnapshotForKind<K extends SnapshotKind> = K extends typeof CBOR_KIND
  ? CborUint8Array<SnapshotNode>
  : K extends typeof CJSON_KIND
    ? JsonUint8Array<SnapshotNode>
    : K extends typeof JSON_KIND
      ? string | Uint8Array
      : never;

/**
 * Three (3) types of "snapshots" are supported:
 * - `cbor`: A CBOR-encoded snapshot
 * - `cjson`: A "compact" JSON-encoded snapshot
 * - `json`: A DirectoryJSON snapshot-ish data structure (lossy)
 */
export type SnapshotKind =
  | typeof CBOR_KIND
  | typeof CJSON_KIND
  | typeof JSON_KIND;

/**
 * CBOR snapshot kind
 */
export const CBOR_KIND = 'cbor';

/**
 * Compact JSON snapshot kind
 */
export const CJSON_KIND = 'cjson';

/**
 * {@link DirectoryJSON} snapshot kind
 */
export const JSON_KIND = 'json';

/**
 * Reads a CBOR-encoded snapshot and populates a virtual file system.
 *
 * @param data - The CBOR-encoded data representing the snapshot.
 * @param options - Options for reading the snapshot.
 * @param options.fs - The file system to populate. Defaults to an in-memory file system.
 * @param options.separator - The path separator to use.
 * @param options.source - The root path of the source.
 * @returns A promise that resolves to the populated file system API.
 */
export async function readCBORSnapshot(
  data: CborUint8Array<SnapshotNode>,
  { fs = memfs().vol, separator, source: root }: ReadSnapshotOptions = {},
): Promise<FsApi> {
  await fromBinarySnapshot(data, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    fs: fs.promises as any,
    path: root,
    separator,
  });
  return fs;
}

/**
 * Reads a CJSON snapshot and populates a filesystem with its contents.
 *
 * @param data - The JSON data representing the snapshot.
 * @param options - Options for reading the snapshot.
 * @param options.fs - The filesystem to populate. Defaults to an in-memory filesystem.
 * @param options.separator - The path separator to use.
 * @param options.source - The root path for the filesystem.
 * @returns A promise that resolves to the populated filesystem API.
 */
export async function readCJSONSnapshot(
  data: JsonUint8Array<SnapshotNode>,
  { fs = memfs().vol, separator, source: root }: ReadSnapshotOptions = {},
): Promise<FsApi> {
  await fromJsonSnapshot(data, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    fs: fs.promises as any,
    path: root,
    separator,
  });
  return fs;
}

/**
 * Reads a directory JSON snapshot and populates a filesystem with its contents.
 *
 * @param data - The JSON data representing the directory structure. Can be a string or Uint8Array.
 * @param options - Options for reading the snapshot.
 * @param options.fs - The filesystem to populate. If not provided, a new in-memory filesystem will be created.
 * @param options.separator - The path separator to use.
 * @param options.source - The root path for the source filesystem.
 *
 * @returns A promise that resolves to the populated filesystem.
 *
 * @throws Will throw an error if the JSON data is invalid.
 */
export async function readDirectoryJSONSnapshot(
  data: string | Uint8Array,
  { fs, separator, source: root }: ReadSnapshotOptions = {},
): Promise<FsApi> {
  const dirJson = (
    typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(new TextDecoder().decode(data))
  ) as DirectoryJSON;
  const { vol } = memfs();
  vol.fromJSON(dirJson);
  // if the user wanted a new filesystem, we're done.
  if (!fs) {
    return vol;
  }
  // otherwise we need to create a snapshot from the temp filesystem,
  // then write it out to the real filesystem (which may be real or virtual).
  // unfortunately there is no such `fs.fromJSON()` method :D
  try {
    // CBOR is faster and smaller than CJSON
    const snapshot = await toBinarySnapshot({ fs: vol.promises, separator });
    await fromBinarySnapshot(snapshot, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      fs: fs.promises as any,
      path: root,
      separator,
    });
  } finally {
    vol.reset();
  }
  return fs;
}

/**
 * Reads a snapshot into a new virtual filesystem or existing filesystem
 *
 * @param data Raw snapshot data in `DirectoryJSON`, CSJON or CBOR format
 * @param options Options
 * @returns The value of `options.fs` populated with the snapshot contents, or a new `memfs` `Volume`.
 */
export async function readSnapshot<
  K extends SnapshotKind,
  T extends SnapshotForKind<K>,
>(kind: K, data: T, options?: ReadSnapshotOptions): Promise<FsApi> {
  await Promise.resolve();
  switch (kind) {
    case CBOR_KIND: {
      try {
        return await readCBORSnapshot(
          data as CborUint8Array<SnapshotNode>,
          options,
        );
      } catch (err) {
        throw new Error(
          `Failed to read snapshot as ${kind}: ${(err as Error).message}`,
        );
      }
    }
    case CJSON_KIND: {
      try {
        return await readCJSONSnapshot(
          data as JsonUint8Array<SnapshotNode>,
          options,
        );
      } catch (err) {
        throw new Error(
          `Failed to read snapshot as ${kind}: ${(err as Error).message}`,
        );
      }
    }
    case JSON_KIND: {
      try {
        return await readDirectoryJSONSnapshot(data as Uint8Array, options);
      } catch (err) {
        throw new Error(
          `Failed to read snapshot as ${kind}: ${(err as Error).message}`,
        );
      }
    }
    default:
      throw new TypeError(`Unknown snapshot kind: ${kind}`);
  }
}
