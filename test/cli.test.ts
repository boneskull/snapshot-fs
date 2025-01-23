import assert from 'node:assert/strict';
import { exec } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import { promisify } from 'node:util';

import { isCompactJson } from '../src/read.js';
import { TEST_ROOT } from './test-root.js';

const CLI_PATH = path.join(TEST_ROOT, '..', 'src', 'cli.ts');
const TEXT_FIXTURE_DIR = path.join(TEST_ROOT, 'fixture', 'text');
const BINARY_FIXTURE_DIR = path.join(TEST_ROOT, 'fixture', 'binary');

const TEXT_SNAPSHOT_FIXTURE = path.join(TEST_ROOT, 'fixture', 'text.json');
const BINARY_SNAPSHOT_FIXTURE = path.join(TEST_ROOT, 'fixture', 'binary.json');

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
  describe('subcommand', () => {
    describe('create', () => {
      describe('when no snapshot path provided', () => {
        it('should print to stdout', async (t) => {
          const { stdout: actual } = await execCli('--dir', TEXT_FIXTURE_DIR);
          t.assert.snapshot(actual);
        });
      });

      describe('when snapshot path provided', () => {
        let tmpDir: string;
        let dest: string;
        let result: { stderr: string; stdout: string };

        before(async () => {
          tmpDir = await mkdtemp(path.join(tmpdir(), 'snapshot-fs-create-'));
          dest = path.join(tmpDir, 'snapshot.json');
        });

        after(async () => {
          await rm(tmpDir, { force: true, recursive: true });
        });

        describe('default behavior', () => {
          beforeEach(async () => {
            result = await execCli('--dir', TEXT_FIXTURE_DIR, dest);
          });

          it('should not print to stdout', async () => {
            assert.deepEqual(result, {
              stderr: `[INFO] Wrote DirectoryJSON snapshot of ${TEXT_FIXTURE_DIR} to ${dest}`,
              stdout: '',
            });
          });

          it('should write DirectoryJSON to file', async (t) => {
            const actual = await readFile(dest, 'utf-8');
            t.assert.snapshot(actual);
          });
        });

        describe('path handling', () => {
          let cwd: string;
          beforeEach(() => {
            cwd = process.cwd();
          });

          afterEach(() => {
            process.chdir(cwd);
          });

          it('should resolve input dir relative to cwd', async (t) => {
            process.chdir(TEST_ROOT);
            await execCli('--dir', path.join('fixture', 'text'), dest);
            const actual = await readFile(dest, 'utf-8');
            t.assert.snapshot(actual);
          });

          it('should resolve output file relative to cwd', async (t) => {
            process.chdir(tmpDir);
            await execCli('--dir', TEXT_FIXTURE_DIR, 'snapshot.json');
            const actual = await readFile(dest, 'utf-8');
            t.assert.snapshot(actual);
          });
        });

        describe('option', () => {
          describe('--binary', () => {
            beforeEach(async () => {
              result = await execCli(
                '--dir',
                BINARY_FIXTURE_DIR,
                '--binary',
                dest,
              );
            });

            it('should not print to stdout', async () => {
              assert.deepEqual(result, {
                stderr: `[INFO] Wrote Compact JSON snapshot of ${BINARY_FIXTURE_DIR} to ${dest}`,
                stdout: '',
              });
            });

            it('should write Compact JSON to file', async (t) => {
              const actual = await readFile(dest, 'utf-8');
              t.assert.snapshot(actual);
            });

            it('should be a Compact JSON snapshot', async () => {
              const actual = await readFile(dest);
              assert.ok(
                isCompactJson(actual),
                'Expected Compact JSON snapshot',
              );
            });
          });

          describe('--json-root', () => {
            it('should set the root of the DirectoryJSON output', async () => {
              const { stdout: actual } = await execCli(
                '--dir',
                TEXT_FIXTURE_DIR,
                '--json-root',
                '/foo',
              );
              const json = JSON.parse(actual) as Record<string, string>;

              assert.deepEqual(json, {
                '/foo/README.md':
                  'This fixture contains this `README.md` file\n',
              });
            });

            describe('when --binary is also provided', () => {
              it('should fail', async () => {
                await assert.rejects(
                  () =>
                    execCli(
                      '--dir',
                      TEXT_FIXTURE_DIR,
                      '--binary',
                      '--json-root',
                      '/foo',
                    ),
                  {
                    message:
                      /Arguments json-root and binary are mutually exclusive/,
                  },
                );
              });
            });
          });
        });
      });
    });

    describe('export', () => {
      let dir: string;
      let dest: string;
      before(async () => {
        dir = await mkdtemp(path.join(tmpdir(), 'snapshot-fs-export-'));
        dest = path.join(dir, 'dest');
      });

      after(async () => {
        await rm(dir, { force: true, recursive: true });
      });

      describe('when used with a DirectoryJSON snapshot', () => {
        it('should re-create the snapshot in the filesystem', async (t) => {
          await execCli('export', TEXT_SNAPSHOT_FIXTURE, dest);
          const { stdout } = await execCli('--dir', dest);
          t.assert.snapshot(stdout);
        });
      });

      describe('when used with a Compact JSON snapshot', () => {
        it('should re-create the snapshot in the filesystem', async (t) => {
          await execCli('export', BINARY_SNAPSHOT_FIXTURE, dest);
          await t.assert.doesNotReject(execCli('--dir', dest));
        });
      });
    });
  });

  describe('--help', () => {
    it('should print help', async (t) => {
      const { stdout: actual } = await execCli('--help');
      t.assert.snapshot(actual);
    });
  });
});
