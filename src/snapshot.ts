/**
 * Provides {@link createSnapshot} which creates a memfs snapshot from the
 * filesystem
 *
 * @module snapshot-fs/snapshot
 * @see {@link https://github.com/streamich/memfs/blob/master/docs/snapshot/index.md}
 */
import {
  type JsonUint8Array,
  type SnapshotNode,
  toJsonSnapshot,
} from 'memfs/lib/snapshot/index.js';
import { type Volume } from 'memfs/lib/volume.js';
import nodeFs from 'node:fs';

/**
 * All files will be relative to this path in the output
 * {@link memfs DirectoryJSON} object
 */
export const DEFAULT_MEMFS_ROOT = '/';

/**
 * Options for {@link createSnapshot}
 */
export interface CreateSnapshotOptions {
  /**
   * Directory to snapshot
   */
  dir?: string;

  /**
   * Filesystem API
   */
  fs?: FsApi;
}

export type FsApi = typeof nodeFs | Volume;

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
}: CreateSnapshotOptions = {}): Promise<JsonUint8Array<SnapshotNode>> {
  const snapshot = await toJsonSnapshot({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    fs: fs ? fs.promises : (nodeFs.promises as any),
    path: dir,
  });
  return snapshot;
}
