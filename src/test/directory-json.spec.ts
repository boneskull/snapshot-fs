/* eslint-disable @typescript-eslint/no-floating-promises */
import { memfs, type DirectoryJSON } from 'memfs';
import { type FsApi } from 'memfs/lib/node/types/index.js';
import assert from 'node:assert';
import { createHash } from 'node:crypto';
import nodeFs from 'node:fs';
import path from 'node:path';
import { before, describe, it } from 'node:test';
import { createDirectoryJson } from '../directory-json.js';
import { sourceDir } from './source-dir.js';

const FIXTURE_DIR = path.join(sourceDir, 'fixture', 'text');

describe('createDirectoryJson()', () => {
  const { vol } = memfs();

  before(async () => {
    const result = await createDirectoryJson({
      fs: nodeFs as unknown as FsApi,
      dir: FIXTURE_DIR,
    });
    vol.fromJSON(JSON.parse(result) as DirectoryJSON, '/');

    console.log(vol.toTree());
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
