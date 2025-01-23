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

import nodeFs from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
  createDirectoryJson,
  createSnapshot,
  exportSnapshot,
} from './index.js';

async function main(): Promise<void> {
  await yargs(hideBin(process.argv))
    .version()
    .strict()
    .help()
    .scriptName('snapshot-fs')
    .epilog(
      `For more information, visit https://github.com/boneskull/snapshot-fs`,
    )
    .command(
      ['$0 [dest]', 'create [dest]'],
      'Create JSON snapshot of directory',
      (yargs) =>
        yargs
          .positional('dest', {
            coerce: path.resolve,
            describe: 'Output .json file; if omitted, written to stdout',
          })
          .options({
            binary: {
              alias: 'b',
              describe: 'Output a memfs JSON snapshot instead of DirectoryJSON',
              type: 'boolean',
            },
            dir: {
              alias: 'd',
              coerce: path.resolve,
              default: process.cwd(),
              defaultDescription: 'Current working directory',
              describe: 'Directory to read from',
              nargs: 1,
              requiresArg: true,
              type: 'string',
            },
            'json-root': {
              alias: 'r',
              coerce: path.posix.normalize,
              description: 'DirectoryJSON root',
              nargs: 1,
              requiresArg: true,
              type: 'string',
            },
          })
          .conflicts('json-root', 'binary'),
      async ({ binary, dest, dir, jsonRoot }) => {
        const output: string = binary
          ? await createSnapshot({ dir })
          : await createDirectoryJson({ dir, root: jsonRoot });

        if (dest) {
          await mkdir(path.dirname(dest), { recursive: true });
          await writeFile(dest, output, 'utf-8');
          console.error(
            '[INFO] Wrote %s snapshot of %s to %s',
            binary ? 'Compact JSON' : 'DirectoryJSON',
            dir,
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
            describe: 'Path to snapshot file',
          })
          .positional('dest', {
            coerce: path.resolve,
            default: process.cwd(),
            defaultDescription: 'Current working directory',
            describe: 'Destination directory',
          }),
      async ({ dest, snapshot }) => {
        const value = await nodeFs.promises.readFile(snapshot);
        await exportSnapshot(value, { dir: dest });
        console.error('[INFO] Exported %s to %s', snapshot, dest);
      },
    )
    .options({})
    .parseAsync();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
