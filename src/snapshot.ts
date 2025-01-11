/**
 * Provides {@link createSnapshot} which creates a memfs snapshot from the
 * filesystem
 *
 * @module snapshot-fs/snapshot
 * @see {@link https://github.com/streamich/memfs/blob/master/docs/snapshot/index.md}
 */
import { memfs } from 'memfs';
import { type FsApi, type FsPromisesApi } from 'memfs/lib/node/types/index.js';
import {
  fromJsonSnapshot,
  type JsonUint8Array,
  type SnapshotNode,
  toJsonSnapshot,
} from 'memfs/lib/snapshot/index.js';
import { type Volume } from 'memfs/lib/volume.js';
import nodeFs from 'node:fs';

/**
 * Options for {@link createSnapshot} and {@link loadSnapshot}
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

/**
 * Options for {@link loadSnapshot}
 */
export interface LoadSnapshotOptions<T extends FsApi = Volume>
  extends CreateSnapshotOptions {
  /**
   * Filesystem API
   */
  fs?: T;
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
}: CreateSnapshotOptions = {}): Promise<string> {
  const snapshot = await toJsonSnapshot({
    fs: fs ? fs.promises : (nodeFs.promises as unknown as FsPromisesApi),
    path: dir,
  });
  return new TextDecoder().decode(snapshot);
}

/**
 * Loads a snapshot from JSON string and returns a new {@link memfs Volume}.
 *
 * @param snapshotJson JSON string of a snapshot, ostensibly loaded from file
 * @param opts Options
 * @returns A new `Volume`
 */
export async function loadSnapshot(
  snapshotJson: string,
  opts?: LoadSnapshotOptions,
): Promise<Volume>;

/**
 * Loads a snapshot from JSON string and populates your filesystem with it.
 *
 * @param snapshotJson JSON string of a snapshot, ostensibly loaded from file
 * @param opts Options
 * @returns Your filesystem
 */
export async function loadSnapshot<T extends FsApi>(
  snapshotJson: string,
  opts: LoadSnapshotOptions<T>,
): Promise<T>;

export async function loadSnapshot(
  snapshotJson: string,
  { dir = '/', fs }: LoadSnapshotOptions = {},
) {
  const snapshot = new TextEncoder().encode(
    snapshotJson,
  ) as JsonUint8Array<SnapshotNode>;
  fs = fs ?? memfs().vol;
  await fromJsonSnapshot(snapshot, { fs: fs.promises, path: dir });

  return fs;
}
