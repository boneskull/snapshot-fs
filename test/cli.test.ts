import { deepEqual } from 'node:assert/strict';
import { exec } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { before, describe, it } from 'node:test';
import { promisify } from 'node:util';

import { sourceDir } from './source-dir.js';

const CLI_PATH = path.join(sourceDir, '..', 'cli.ts');
const FIXTURE_DIR = path.join(sourceDir, 'fixture', 'text');

const execAsync = promisify(exec);

/**
 * Executes the CLI command with the provided arguments and returns the trimmed `stdout` and `stderr`.
 *
 * @param args - The arguments to pass to the CLI command.
 * @returns An object containing the trimmed `stdout` and `stderr`.
 */
async function execCli(...args: string[]) {
  const { stderr, stdout } = await execAsync(
    `npx tsx ${CLI_PATH} ${args.join(' ')}`,
  );
  return {
    stderr: stderr.trim(),
    stdout: stdout.trim(),
  };
}

describe('snapshot-fs cli', () => {
  describe('when no output filepath provided', () => {
    it('should print to stdout', async (t) => {
      const { stdout: actual } = await execCli(FIXTURE_DIR);
      t.assert.snapshot(actual);
    });
  });

  describe('when output path provided', () => {
    let dir: string;
    let dest: string;
    let result: { stderr: string; stdout: string };

    before(async () => {
      dir = await mkdtemp(path.join(tmpdir(), 'snapshot-fs-'));
      dest = path.join(dir, 'snapshot.json');
      result = await execCli(FIXTURE_DIR, dest);
    });

    it('should not print to stdout', async () => {
      deepEqual(result, {
        stderr: `[INFO] Wrote DirectoryJSON of ${FIXTURE_DIR} to ${dest}`,
        stdout: '',
      });
    });

    it('should write to file', async (t) => {
      const actual = await readFile(dest, 'utf-8');
      t.assert.snapshot(actual);
    });
  });

  describe('--help', () => {
    it('should print help', async (t) => {
      const { stdout: actual } = await execCli('--help');
      t.assert.snapshot(actual);
    });
  });

  describe('--root', () => {
    it('should set the root of the DirectoryJSON output', async () => {
      const { stdout: actual } = await execCli(FIXTURE_DIR, '--root', '/foo');
      const json = JSON.parse(actual) as object;

      deepEqual(json, {
        '/foo/README.md': 'This fixture contains this `README.md` file\n',
      });
    });
  });
});
