// @ts-check

import { toJsonSnapshot } from 'memfs/lib/snapshot/index.js';
import fsPromises from 'node:fs/promises';

/**
 * @typedef CreateSnapshotOptions
 * @property {string} [dir]
 * @property {import('memfs/lib/node/types/index.js').FsPromisesApi} [fs]
 */

/**
 * Creates a `memfs` `Volume` from the filesystem.
 *
 * All paths will be computed relative to the current working directory.
 *
 * @param {CreateSnapshotOptions} opts
 * @returns {Promise<
 *   import('memfs/lib/snapshot/json.js').JsonUint8Array<
 *     import('memfs/lib/snapshot/types.js').SnapshotNode
 *   >
 * >}
 */
export async function createSnapshot({ dir = process.cwd(), fs }) {
  return toJsonSnapshot({
    fs: /** @type {any} */ (fs ?? fsPromises),
    path: dir,
  });
}
