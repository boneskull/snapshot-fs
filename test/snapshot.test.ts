import { expect } from 'bupkis';
import { type DirectoryJSON, memfs } from 'memfs';
import {
  fromBinarySnapshot,
  fromJsonSnapshot,
} from 'memfs/lib/snapshot/index.js';
import { createHash } from 'node:crypto';
import nodeFs from 'node:fs';
import path from 'node:path';
import { before, describe, it } from 'node:test';

import {
  createCBORSnapshot,
  createCJSONSnapshot,
  createJSONSnapshot,
} from '../src/snapshot.js';
import { TEST_ROOT } from './test-root.js';

const FIXTURE_DIR = path.join(TEST_ROOT, 'fixture', 'binary');

describe('createCJSONSnapshot()', () => {
  const { vol } = memfs();

  before(async () => {
    const snapshot = await createCJSONSnapshot({
      fs: nodeFs,
      source: FIXTURE_DIR,
    });

    await fromJsonSnapshot(snapshot, { fs: vol.promises, path: '/' });
  });

  it('should clone binary files', async () => {
    const [actualFile, expectedFile] = await Promise.all([
      nodeFs.promises.readFile(path.join(FIXTURE_DIR, 'HappyFish.jpg')),
      vol.promises.readFile(path.join('/', 'HappyFish.jpg')),
    ]);
    const actualHash = createHash('sha256').update(actualFile).digest('hex');
    const expectedHash = createHash('sha256')
      .update(expectedFile)
      .digest('hex');

    expect(actualHash, 'to equal', expectedHash);
  });
});

describe('createCBORSnapshot()', () => {
  const { vol } = memfs();

  before(async () => {
    const snapshot = await createCBORSnapshot({
      fs: nodeFs,
      source: FIXTURE_DIR,
    });

    await fromBinarySnapshot(snapshot, { fs: vol.promises, path: '/' });
  });

  it('should clone binary files', async () => {
    const [actualFile, expectedFile] = await Promise.all([
      nodeFs.promises.readFile(path.join(FIXTURE_DIR, 'HappyFish.jpg')),
      vol.promises.readFile(path.join('/', 'HappyFish.jpg')),
    ]);
    const actualHash = createHash('sha256').update(actualFile).digest('hex');
    const expectedHash = createHash('sha256')
      .update(expectedFile)
      .digest('hex');

    expect(actualHash, 'to equal', expectedHash);
  });
});

describe('createJSONSnapshot()', () => {
  const { vol } = memfs();

  before(async () => {
    const result = await createJSONSnapshot({
      fs: nodeFs,
      source: FIXTURE_DIR,
    });
    vol.fromJSON(JSON.parse(result) as DirectoryJSON, '/');
  });

  it('should clone text files', async () => {
    const [actualFile, expectedFile] = await Promise.all([
      nodeFs.promises.readFile(path.join(FIXTURE_DIR, 'README.md')),
      vol.promises.readFile(path.join('/', 'README.md')),
    ]);
    const actualHash = createHash('sha256').update(actualFile).digest('hex');
    const expectedHash = createHash('sha256')
      .update(expectedFile)
      .digest('hex');

    expect(actualHash, 'to equal', expectedHash);
  });
});
