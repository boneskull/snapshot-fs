import { memfs } from 'memfs';
import { type FsApi } from 'memfs/lib/node/types/index.js';
import {
  fromJsonSnapshot,
  type JsonUint8Array,
} from 'memfs/lib/snapshot/json.js';
import { type SnapshotNode } from 'memfs/lib/snapshot/types.js';
import assert from 'node:assert';
import { createHash } from 'node:crypto';
import nodeFs from 'node:fs';
import path from 'node:path';
import { before, describe, it } from 'node:test';
import { createSnapshot } from '../snapshot.js';
import { sourceDir } from './source-dir.js';

const FIXTURE_DIR = path.join(sourceDir, 'fixture', 'binary');

describe('createSnapshot()', () => {
  const { vol } = memfs();

  before(async () => {
    const result = await createSnapshot({
      fs: nodeFs as unknown as FsApi,
      dir: FIXTURE_DIR,
    });

    // round-trip the snapshot through JSON
    const json = result.toString();

    const snapshot = new TextEncoder().encode(
      json,
    ) as JsonUint8Array<SnapshotNode>;

    await fromJsonSnapshot(snapshot, { fs: vol.promises, path: '/' });
  });

  it('should clone binary files', async () => {
    const [realFile, memFile] = await Promise.all([
      nodeFs.promises.readFile(path.join(FIXTURE_DIR, 'HappyFish.jpg')),
      vol.promises.readFile(path.join('/', 'HappyFish.jpg')),
    ]);
    const realHash = createHash('sha256').update(realFile).digest('hex');
    const memHash = createHash('sha256').update(memFile).digest('hex');

    assert.strictEqual(realHash, memHash);
  });
});
