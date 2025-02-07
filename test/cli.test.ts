import { memfs } from 'memfs';
import { exec } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import { promisify } from 'node:util';

import { CBOR_KIND, CJSON_KIND, JSON_KIND, readSnapshot } from '../src/read.js';
import { TEST_ROOT } from './test-root.js';

const CLI_PATH = path.join(TEST_ROOT, '..', 'src', 'cli.ts');
const FIXTURE_DIR = path.join(TEST_ROOT, 'fixture');
const TEXT_FIXTURE_DIR = path.join(FIXTURE_DIR, 'text');
const BINARY_FIXTURE_DIR = path.join(FIXTURE_DIR, 'binary');

const FIXTURES = {
  [CBOR_KIND]: path.join(FIXTURE_DIR, 'snapshot.cbor'),
  [CJSON_KIND]: path.join(FIXTURE_DIR, 'snapshot.cjson'),
  [JSON_KIND]: path.join(FIXTURE_DIR, 'snapshot.json'),
} as const;

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
          const { stdout: actual } = await execCli(
            '--source',
            TEXT_FIXTURE_DIR,
          );
          t.assert.notEqual(actual, '');
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

        describe('default behavior w/ source dir', () => {
          beforeEach(async () => {
            result = await execCli('--source', TEXT_FIXTURE_DIR, dest);
          });

          it('should not print to stdout', (t) => {
            t.assert.equal(result.stdout, '');
          });

          it('should print summary to stderr', (t) => {
            t.assert.match(
              result.stderr,
              new RegExp(
                `\\[INFO\\] Wrote ${CJSON_KIND.toUpperCase()} snapshot of .+?\\sto\\s.+`,
              ),
            );
          });

          it(`should write a ${CJSON_KIND.toUpperCase()} snapshot`, async (t) => {
            const actual = await readFile(dest, 'utf-8');
            t.assert.doesNotThrow(() => JSON.parse(actual));
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
            await execCli('--source', path.join('fixture', 'text'), dest);
            const actual = await readFile(dest, 'utf-8');
            t.assert.snapshot(actual);
          });

          it('should resolve output file relative to cwd', async (t) => {
            process.chdir(tmpDir);
            await execCli('--source', TEXT_FIXTURE_DIR, 'snapshot.json');
            const actual = await readFile(dest, 'utf-8');
            t.assert.snapshot(actual);
          });
        });

        describe('option', () => {
          for (const kind of [CBOR_KIND, CJSON_KIND, JSON_KIND] as const) {
            describe(`--format=${kind}`, () => {
              beforeEach(async () => {
                result = await execCli(
                  '--source',
                  BINARY_FIXTURE_DIR,
                  '--format',
                  kind,
                  dest,
                );
              });

              it('should not print to stdout', (t) => {
                t.assert.equal(result.stdout, '');
              });

              it('should print summary to stderr', (t) => {
                t.assert.match(
                  result.stderr,
                  new RegExp(
                    `\\[INFO\\] Wrote ${kind.toUpperCase()} snapshot of .+?\\sto\\s.+`,
                  ),
                );
              });

              it('should write a snapshot to file', async (t) => {
                const actual = await readFile(dest);
                t.assert.snapshot(actual, {
                  serializers: [
                    (value) => Buffer.from(value).toString('base64'),
                  ],
                });
              });

              it(`should be a ${kind.toUpperCase()} snapshot`, async (t) => {
                const actual = await readFile(dest);
                await t.assert.doesNotReject(
                  readSnapshot(kind, actual as any, { fs: memfs().fs }),
                  `Expected ${kind} snapshot`,
                );
              });
            });
          }
        });
      });
    });

    describe('export', () => {
      let tempdir: string;

      before(async () => {
        tempdir = await mkdtemp(path.join(tmpdir(), 'snapshot-fs-export-'));
      });

      after(async () => {
        await rm(tempdir, { force: true, recursive: true });
      });

      for (const kind of [CBOR_KIND, CJSON_KIND, JSON_KIND] as const) {
        describe(`--format=${kind}`, () => {
          it('should export accurate snapshot contents to the filesystem', async (t) => {
            // this roundtrips a snapshot to a temp dir and back into a snapshot,
            // then does a deep comparison of the two results.
            // I am unsure how stable `Volume.toJSON()` is.
            const expectedSnapshot = FIXTURES[kind];
            const destdir = path.join(tempdir, `exported-${kind}`);
            const actualSnapshot = path.join(
              tempdir,
              `exported-snapshot.${kind}`,
            );

            await execCli(
              'export',
              expectedSnapshot,
              destdir,
              '--format',
              kind,
            );
            await execCli(
              '--source',
              destdir,
              actualSnapshot,
              '--format',
              kind,
            );
            const { vol: actualVol } = memfs();
            const { vol: expectedVol } = memfs();
            await Promise.all([
              readSnapshot(kind, await readFile(actualSnapshot), {
                fs: actualVol,
              }),
              readSnapshot(kind, await readFile(expectedSnapshot), {
                fs: expectedVol,
              }),
            ]);

            t.assert.deepEqual(actualVol.toJSON(), expectedVol.toJSON());
          });
        });
      }
    });
  });

  describe('--help', () => {
    it('should print help', async (t) => {
      const { stdout: actual } = await execCli('--help');
      t.assert.snapshot(actual);
    });
  });
});
