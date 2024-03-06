/**
 * Provides {@link createDirectoryJson} which creates a {@link memfs Volume} from
 * the filesystem
 *
 * @module snapshot-fs/directory-json
 */

import { glob } from 'glob';
import isBinaryPath from 'is-binary-path';
import { memfs } from 'memfs';
import type { FsPromisesApi } from 'memfs/lib/node/types/FsPromisesApi.js';
import type { DirectoryJSON, Volume } from 'memfs/lib/volume.js';
import fsPromises from 'node:fs/promises';
import path from 'node:path';

/**
 * All files will be relative to this path in the output
 * {@link memfs DirectoryJSON} object
 */
const DEFAULT_MEMFS_ROOT = '/';

/**
 * Options for {@link createDirectoryJson}
 */
export interface CreateDirectoryJsonOptions {
  /**
   * Directory to recursively include
   */
  dir?: string;

  /**
   * Memfs root
   */
  root?: string;

  /**
   * Promise-based filesystem object
   */
  fs?: FsPromisesApi;
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
  root = DEFAULT_MEMFS_ROOT,
  fs = fsPromises as unknown as FsPromisesApi,
}: CreateDirectoryJsonOptions = {}): Promise<Volume> {
  // recursify dirs
  const dirPattern: string = path.join(dir, '**');

  const files = await glob(dirPattern, {
    // we don't actually need filetypes, but we want the PathScurry objects
    withFileTypes: true,
    // don't need dirs because memfs creates dir structure from relative
    // filepaths
    nodir: true,
    // include dotfiles because createSnapshot does
    dot: true,
    root,
  });

  // instead of building a JSON object, we could actually use mkdir/writeFile,
  // but that's slow
  const entries = await Promise.all(
    files.map(async (file) => {
      if (isBinaryPath(file.name)) {
        console.error(
          '[WARN] Found potential binary file %s; use --binary instead',
          file.fullpath(),
        );
      }
      const content = await fs.readFile(file.fullpath(), 'utf-8');
      return [file.relativePosix(), content];
    }),
  );

  const { vol } = memfs(Object.fromEntries(entries) as DirectoryJSON, root);
  return vol;
}
