import { type DirectoryJSON, memfs } from 'memfs';
import { type FsApi } from 'memfs/lib/node/types/index.js';
import assert from 'node:assert';
import { createHash } from 'node:crypto';
import nodeFs from 'node:fs';
import path from 'node:path';
import { before, describe, it } from 'node:test';

import { createDirectoryJson } from '../src/directory-json.js';
import { testRoot } from './test-root.js';

const FIXTURE_DIR = path.join(testRoot, 'fixture', 'text');

describe('createDirectoryJson()', () => {
  const { vol } = memfs();

  before(async () => {
    const result = await createDirectoryJson({
      dir: FIXTURE_DIR,
      fs: nodeFs as unknown as FsApi,
    });
    vol.fromJSON(JSON.parse(result) as DirectoryJSON, '/');
  });

  it('should clone text files', async () => {
    const [realFile, memFile] = await Promise.all([
      nodeFs.promises.readFile(path.join(FIXTURE_DIR, 'README.md')),
      vol.promises.readFile(path.join('/', 'README.md')),
    ]);
    const realHash = createHash('sha256').update(realFile).digest('hex');
    const memHash = createHash('sha256').update(memFile).digest('hex');

    assert.strictEqual(realHash, memHash);
  });
});
