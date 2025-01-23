import { memfs } from 'memfs';
import nodeFs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

import { readSnapshot } from '../src/read.js';
import { TEST_ROOT } from './test-root.js';

const TEXT_SNAPSHOT_FIXTURE = path.join(TEST_ROOT, 'fixture', 'text.json');
const BINARY_SNAPSHOT_FIXTURE = path.join(TEST_ROOT, 'fixture', 'binary.json');

describe('readSnapshot()', () => {
  const { vol } = memfs();

  describe('with a DirectoryJSON snapshot', () => {
    it('should read the snapshot into the filesystem', async (t) => {
      const snapshot = await nodeFs.promises.readFile(TEXT_SNAPSHOT_FIXTURE);
      await readSnapshot(snapshot, { fs: vol });
      t.assert.snapshot(vol.toTree());
    });
  });

  describe('with a Compact JSON snapshot', () => {
    it('should read the snapshot into the filesystem', async (t) => {
      const snapshot = await nodeFs.promises.readFile(BINARY_SNAPSHOT_FIXTURE);
      await readSnapshot(snapshot, { fs: vol });
      t.assert.snapshot(vol.toTree());
    });
  });
});
