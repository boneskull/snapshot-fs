/**
 * Provides {@link createSnapshot} which creates a memfs snapshot from the
 * filesystem
 *
 * @module snapshot-fs/snapshot
 * @see {@link https://github.com/streamich/memfs/blob/master/docs/snapshot/index.md}
 */
import { promises as fsPromises } from 'fs';
import { type FsPromisesApi } from 'memfs/lib/node/types/index.js';
import { toJsonSnapshot } from 'memfs/lib/snapshot/index.js';
import { type JsonUint8Array } from 'memfs/lib/snapshot/json.js';
import { type SnapshotNode } from 'memfs/lib/snapshot/types.js';

/**
 * Options for {@link createSnapshot}
 */
export interface CreateSnapshotOptions {
  /**
   * Directory to snapshot
   */
  dir?: string;

  /**
   * Promise-based filesystem API
   */
  fs?: FsPromisesApi;
}

/**
 * Creates a `memfs` `Volume` from the filesystem.
 *
 * All paths will be computed relative to the current working directory.
 *
 * @param opts Options for creating the snapshot
 * @returns A promise that resolves to the snapshot
 */
export async function createSnapshot({
  dir = process.cwd(),
  fs,
}: CreateSnapshotOptions): Promise<JsonUint8Array<SnapshotNode>> {
  return toJsonSnapshot({
    fs: fs ?? (fsPromises as unknown as FsPromisesApi),
    path: dir,
  });
}
