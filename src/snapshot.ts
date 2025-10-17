/**
 * Provides {@link createCJSONSnapshot} which creates a memfs snapshot from the
 * filesystem
 *
 * @module snapshot-fs/snapshot
 * @see {@link https://github.com/streamich/memfs/blob/master/docs/snapshot/index.md}
 */
// eslint-disable-next-line n/no-missing-import
import { type CborUint8Array } from '@jsonjoy.com/json-pack/lib/cbor/index.js';
import stableStringify from 'json-stable-stringify';
import { memfs, type Volume } from 'memfs';
import {
  type JsonUint8Array,
  type SnapshotNode,
  toBinarySnapshot,
  toJsonSnapshot,
} from 'memfs/lib/snapshot/index.js';
import nodeFs from 'node:fs';
import { type sep } from 'node:path';

import { CBOR_KIND, readSnapshot } from './read.js';

/**
 * All files will be relative to this path in the output
 * {@link memfs DirectoryJSON} object
 */
export const DEFAULT_MEMFS_ROOT = '/';

/**
 * Options for {@link createCJSONSnapshot}
 */
export interface CreateSnapshotOptions {
  /**
   * Filesystem API
   */
  fs?: FsApi;

  separator?: typeof sep;

  /**
   * Source to snapshot
   */
  source?: string;
}

export type FsApi = typeof nodeFs | Volume;

/**
 * Creates a CBOR snapshot from the `from` path using the filesystem API `fs`.
 *
 * @param opts Options for creating the snapshot
 * @returns A promise that resolves to the snapshot
 */
export async function createCBORSnapshot({
  fs,
  source: path = process.cwd(),
}: CreateSnapshotOptions = {}): Promise<CborUint8Array<SnapshotNode>> {
  const snapshot = await toBinarySnapshot({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    fs: fs ? fs.promises : (nodeFs.promises as any),
    path,
  });
  return snapshot;
}

/**
 * Creates a CJSON snapshot from the `from` path using the filesystem API `fs`.
 *
 * @param opts Options for creating the snapshot
 * @returns A promise that resolves to the snapshot
 */
export async function createCJSONSnapshot({
  fs,
  separator,
  source: path = process.cwd(),
}: CreateSnapshotOptions = {}): Promise<JsonUint8Array<SnapshotNode>> {
  const snapshot = await toJsonSnapshot({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    fs: fs ? fs.promises : (nodeFs.promises as any),
    path,
    separator,
  });
  return snapshot;
}

/**
 * Creates a CJSON snapshot from the `from` path using the filesystem API `fs`.
 *
 * @param opts Options for creating the snapshot
 * @returns A promise that resolves to the snapshot
 */
export async function createJSONSnapshot({
  fs,
  separator,
  source: path = process.cwd(),
}: CreateSnapshotOptions = {}): Promise<string> {
  const { vol } = memfs();
  const tempSnapshot = await toBinarySnapshot({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    fs: fs ? fs.promises : (nodeFs.promises as any),
    path,
    separator,
  });
  await readSnapshot(CBOR_KIND, tempSnapshot, { fs: vol, separator });
  const snapshot = stableStringify(vol.toJSON());

  /* c8 ignore next */
  if (snapshot === undefined) {
    throw new Error('Snapshot is empty!');
  }
  return snapshot;
}
