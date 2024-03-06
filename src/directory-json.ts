/**
 * Provides {@link createDirectoryJson} which creates a {@link memfs Volume} from
 * the filesystem
 *
 * @module snapshot-fs/directory-json
 */

import { globIterate, type FSOption } from 'glob';
import isBinaryPath from 'is-binary-path';
import { memfs } from 'memfs';
import { type FsApi } from 'memfs/lib/node/types/index.js';
import type { DirectoryJSON } from 'memfs/lib/volume.js';
import nodeFs from 'node:fs';
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
   * Filesystem API
   */
  fs?: FsApi;
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
  fs,
}: CreateDirectoryJsonOptions = {}): Promise<string> {
  // recursify dirs
  const dirPattern: string = path.join(dir, '**', '*');

  fs = fs ?? (nodeFs as unknown as FsApi);

  const json: DirectoryJSON = {};

  for await (const file of globIterate(dirPattern, {
    // we don't actually need filetypes, but we want the PathScurry objects
    withFileTypes: true,
    // don't need dirs because memfs creates dir structure from relative
    // filepaths
    nodir: true,
    // include dotfiles because createSnapshot does
    dot: true,
    fs: fs as unknown as FSOption,
    cwd: dir,
  })) {
    if (isBinaryPath(file.name)) {
      console.error('[WARN] Found potential binary file %s', file.fullpath());
    }

    json[file.relativePosix()] = await fs.promises.readFile(
      file.fullpath(),
      'utf-8',
    );
  }

  const { vol } = memfs(json, root);

  return JSON.stringify(vol.toJSON(), null, 2);
}
