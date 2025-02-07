#!/usr/bin/env node

/* eslint-disable @typescript-eslint/unbound-method */
/**
 * Writes a DirectoryJSON object or snapshot (with --binary flag) to file.
 *
 * For use with memfs.
 *
 * @module snapshot-fs/cli
 * @see {@link https://npm.im/memfs}
 */

// eslint-disable-next-line n/no-missing-import
import { type CborUint8Array } from '@jsonjoy.com/json-pack/lib/cbor/index.js';
import { type JsonUint8Array } from 'memfs/lib/snapshot/json.js';
import { type SnapshotNode } from 'memfs/lib/snapshot/types.js';
import nodeFs from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
  CBOR_KIND,
  CJSON_KIND,
  createCBORSnapshot,
  createCJSONSnapshot,
  createJSONSnapshot,
  exportSnapshot,
  JSON_KIND,
} from './index.js';

const GROUP_OUTPUT = 'Output:';
const GROUP_INPUT = 'Input:';

async function main(): Promise<void> {
  await yargs(hideBin(process.argv))
    .version()
    .strict()
    .help()
    .scriptName('snapshot-fs')
    .epilog(
      `For more information, visit https://github.com/boneskull/snapshot-fs`,
    )
    .options({
      separator: {
        alias: 'sep',
        choices: ['posix', 'win32'],
        default: 'posix',
        describe: 'Path separator',
        global: true,
        group: GROUP_OUTPUT,
      },
    })

    .middleware((argv) => {
      argv.separator =
        argv.separator === 'posix' ? path.posix.sep : path.win32.sep;
    })
    .command(
      ['$0 [dest]', 'create [dest]'],
      'Create memfs snapshot from filesystem',
      (yargs) =>
        yargs
          .positional('dest', {
            coerce: path.resolve,
            describe: 'Path to output file',
          })
          .options({
            format: {
              alias: 'f',
              choices: [CBOR_KIND, CJSON_KIND, JSON_KIND],
              default: CJSON_KIND,
              describe: 'Snapshot format',
              group: GROUP_OUTPUT,
              nargs: 1,
              requiresArg: true,
              type: 'string',
            },
            source: {
              alias: 's',
              coerce: path.resolve,
              default: process.cwd(),
              defaultDescription: '(current directory)',
              describe: 'File or directory to snapshot',
              group: GROUP_INPUT,
              nargs: 1,
              requiresArg: true,
              type: 'string',
            },
          }),
      async ({ dest, format: kind, separator, source }) => {
        const pathSep = separator as typeof path.sep;
        if (kind === JSON_KIND) {
          console.error(
            '[WARN] DirectoryJSON output is lossy and should be avoided',
          );
        }
        const output =
          kind === CBOR_KIND
            ? await createCBORSnapshot({
                separator: pathSep,
                source,
              })
            : kind === JSON_KIND
              ? await createJSONSnapshot({ separator: pathSep, source })
              : await createCJSONSnapshot({ separator: pathSep, source });

        if (dest) {
          await mkdir(path.dirname(dest), { recursive: true });

          await writeFile(dest, output);

          console.error(
            '[INFO] Wrote %s snapshot of %s to %s',
            kind.toUpperCase(),
            source,
            dest,
          );
        } else {
          console.log(output);
        }
      },
    )
    .command(
      'export <snapshot> [dest]',
      'Export a JSON snapshot to the filesystem',
      (yargs) =>
        yargs
          .positional('snapshot', {
            coerce: path.resolve,
            demandOption: true,
            describe: 'Path to snapshot file (CBOR/CJSON/DirectoryJSON)',
          })
          .positional('dest', {
            coerce: path.resolve,
            default: process.cwd(),
            defaultDescription: 'Current working directory',
            describe: 'Destination directory',
          })
          .options({
            'dry-run': {
              alias: 'D',
              description: 'Print what would be written to the filesystem',
              type: 'boolean',
            },
            format: {
              alias: 'f',
              choices: [CBOR_KIND, CJSON_KIND, JSON_KIND],
              default: CJSON_KIND,
              describe: 'Snapshot format',
              nargs: 1,
              requiresArg: true,
              type: 'string',
            },
          }),
      async ({ dest, dryRun, format: kind, snapshot }) => {
        const data = (await nodeFs.promises.readFile(snapshot)) as unknown;
        switch (kind) {
          case CBOR_KIND: {
            await exportSnapshot(kind, data as CborUint8Array<SnapshotNode>, {
              dest,
              dryRun,
            });
            break;
          }
          case CJSON_KIND: {
            await exportSnapshot(kind, data as JsonUint8Array<SnapshotNode>, {
              dest,
              dryRun,
            });
            break;
          }
          case JSON_KIND: {
            await exportSnapshot(kind, data as Uint8Array, {
              dest,
              dryRun,
            });
            break;
          }

          /* c8 ignore next */
          default: {
            throw new TypeError('Invalid format');
          }
        }

        if (!dryRun) {
          console.error(
            '[INFO] Exported %s snapshot of %s to %s',
            kind.toUpperCase(),
            snapshot,
            dest,
          );
        }
      },
    )
    .options({})
    .parseAsync();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
