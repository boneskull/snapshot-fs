import Snap from '@matteo.collina/snap';
import { deepEqual, equal } from 'node:assert/strict';
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
const snap = Snap(sourceDir);

/**
 * Executes the CLI command with the provided arguments and returns the trimmed `stdout` and `stderr`.
 *
 * @param args - The arguments to pass to the CLI command.
 * @returns An object containing the trimmed `stdout` and `stderr`.
 */
async function execCli(...args: string[]) {
  const { stdout, stderr } = await execAsync(
    `npx tsx ${CLI_PATH} ${args.join(' ')}`,
  );
  return {
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  };
}

describe('snapshot-fs cli', () => {
  describe('when no output filepath provided', () => {
    it('should print to stdout', async () => {
      const { stdout: actual } = await execCli(FIXTURE_DIR);
      const expected = await snap(actual);
      equal(actual, expected);
    });
  });

  describe('when output path provided', () => {
    let dir: string;
    let dest: string;
    let result: { stdout: string; stderr: string };

    before(async () => {
      dir = await mkdtemp(path.join(tmpdir(), 'snapshot-fs-'));
      dest = path.join(dir, 'snapshot.json');
      result = await execCli(FIXTURE_DIR, dest);
    });

    it('should not print to stdout', async () => {
      deepEqual(result, {
        stdout: '',
        stderr: `[INFO] Wrote DirectoryJSON of ${FIXTURE_DIR} to ${dest}`,
      });
    });

    it('should write to file', async () => {
      const actual = await readFile(dest, 'utf-8');
      const expected = await snap(actual);
      equal(actual, expected);
    });
  });

  describe('--help', () => {
    it('should print help', async () => {
      const { stdout: actual } = await execCli('--help');
      const expected = await snap(actual);
      equal(actual, expected);
    });
  });

  describe('--root', () => {
    it('should set the root of the DirectoryJSON output', async () => {
      const { stdout: actual } = await execCli(FIXTURE_DIR, '--root', '/foo');
      const json = JSON.parse(actual);

      deepEqual(json, {
        '/foo/README.md': 'This fixture contains this `README.md` file\n',
      });
    });
  });
});
