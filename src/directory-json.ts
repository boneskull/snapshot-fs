/**
 * Provides {@link createDirectoryJson} which creates a {@link memfs Volume} from
 * the filesystem
 *
 * @module snapshot-fs/directory-json
 */

import { memfs } from 'memfs';
import { type FsApi } from 'memfs/lib/node/types/index.js';
import nodeFs from 'node:fs';

import { readSnapshot } from './read.js';
import { createSnapshot, DEFAULT_MEMFS_ROOT } from './snapshot.js';

/**
 * Options for {@link createDirectoryJson}
 */
export interface CreateDirectoryJsonOptions {
  /**
   * Directory to recursively include
   */
  dir?: string;

  /**
   * Filesystem API
   */
  fs?: FsApi;

  /**
   * Memfs root
   */
  root?: string;
}

/**
 * Creates a {@link memfs Volume} from the filesystem
 *
 * All paths will be computed relative to the current working directory.
 *
 * @param options Options
 * @returns A promise that resolves to the Volume
 */
export async function createDirectoryJson({
  dir = process.cwd(),
  fs,
  root = DEFAULT_MEMFS_ROOT,
}: CreateDirectoryJsonOptions = {}): Promise<string> {
  const snapshot = await createSnapshot({
    dir,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    fs: fs ?? (nodeFs as any),
  });

  const { vol } = memfs();
  await readSnapshot(snapshot, { dir: root, fs: vol });

  return JSON.stringify(vol.toJSON(), null, 2);
}
