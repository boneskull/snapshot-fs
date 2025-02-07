import { memfs } from 'memfs';
import {
  type JsonUint8Array,
  type SnapshotNode,
} from 'memfs/lib/snapshot/index.js';
import nodeFs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

import { CJSON_KIND, JSON_KIND, readSnapshot } from '../src/read.js';
import { TEST_ROOT } from './test-root.js';

const JSON_SNAPSHOT_FIXTURE = path.join(TEST_ROOT, 'fixture', 'snapshot.json');
const CJSON_SNAPSHOT_FIXTURE = path.join(
  TEST_ROOT,
  'fixture',
  'snapshot.cjson',
);

describe('readSnapshot()', () => {
  const { vol } = memfs();

  describe('with a DirectoryJSON snapshot', () => {
    it('should read the snapshot into the filesystem', async (t) => {
      const snapshot = await nodeFs.promises.readFile(JSON_SNAPSHOT_FIXTURE);
      await readSnapshot(JSON_KIND, snapshot, { fs: vol });
      t.assert.snapshot(vol.toTree());
    });
  });

  describe('with a Compact JSON snapshot', () => {
    it('should read the snapshot into the filesystem', async (t) => {
      const snapshot = (await nodeFs.promises.readFile(
        CJSON_SNAPSHOT_FIXTURE,
      )) as unknown as JsonUint8Array<SnapshotNode>;
      await readSnapshot(CJSON_KIND, snapshot, { fs: vol });
      t.assert.snapshot(vol.toTree());
    });
  });
});
