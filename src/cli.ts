#!/usr/bin/env node

/**
 * Writes a DirectoryJSON object or snapshot (with --binary flag) to file.
 *
 * For use with memfs.
 *
 * @module snapshot-fs/cli
 * @see {@link https://npm.im/memfs}
 */

import { bargs, opt, pos } from '@boneskull/bargs';
import { type JsonUint8Array } from 'memfs/lib/snapshot/json.js';
import { type SnapshotNode } from 'memfs/lib/snapshot/types.js';
import nodeFs, { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CBOR_KIND,
  CJSON_KIND,
  createCBORSnapshot,
  createCJSONSnapshot,
  createJSONSnapshot,
  exportSnapshot,
  JSON_KIND,
} from './index.js';
import { type CborUint8Array } from './types.js';

// Extract version from package.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'),
) as { version: string };

// Shared format choices for both commands
const FORMAT_CHOICES = [CBOR_KIND, CJSON_KIND, JSON_KIND] as const;

async function main(): Promise<void> {
  // Create command parser: options + positional
  const createOptions = opt.options({
    format: opt.enum(FORMAT_CHOICES, {
      aliases: ['f'],
      default: CJSON_KIND,
      description: 'Snapshot format',
    }),
    separator: opt.enum(['posix', 'win32'], {
      aliases: ['sep'],
      default: 'posix',
      description: 'Path separator',
    }),
    source: opt.string({
      aliases: ['s'],
      default: process.cwd(),
      description: 'File or directory to snapshot',
    }),
  });

  const createPositionals = pos.positionals(
    pos.string({ description: 'Path to output file', name: 'dest' }),
  );

  const createParser = createPositionals(createOptions);

  // Export command parser: options + positionals
  const exportOptions = opt.options({
    'dry-run': opt.boolean({
      aliases: ['D'],
      description: 'Print what would be written to the filesystem',
    }),
    format: opt.enum(FORMAT_CHOICES, {
      aliases: ['f'],
      default: CJSON_KIND,
      description: 'Snapshot format',
    }),
    separator: opt.enum(['posix', 'win32'], {
      aliases: ['sep'],
      default: 'posix',
      description: 'Path separator',
    }),
  });

  const exportPositionals = pos.positionals(
    pos.string({
      description: 'Path to snapshot file (CBOR/CJSON/DirectoryJSON)',
      name: 'snapshot',
      required: true,
    }),
    pos.string({
      default: process.cwd(),
      description: 'Destination directory',
      name: 'dest',
    }),
  );

  const exportParser = exportPositionals(exportOptions);

  await bargs
    .create('snapshot-fs', {
      epilog:
        'For more information, visit https://github.com/boneskull/snapshot-fs',
      version: pkg.version,
    })
    .command(
      'create',
      createParser,
      async ({ positionals, values }) => {
        const [destRaw] = positionals;
        const dest = destRaw ? path.resolve(destRaw) : undefined;
        const kind = values.format;
        const source = path.resolve(values.source);
        // Transform separator string to actual path separator
        const pathSep =
          values.separator === 'posix' ? path.posix.sep : path.win32.sep;

        if (kind === JSON_KIND) {
          console.error(
            '[WARN] DirectoryJSON output is lossy and should be avoided',
          );
        }

        const output =
          kind === CBOR_KIND
            ? await createCBORSnapshot({ separator: pathSep, source })
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
      'Create memfs snapshot from filesystem',
    )
    .command(
      'export',
      exportParser,
      async ({ positionals, values }) => {
        const [snapshotRaw, destRaw] = positionals;
        const snapshot = path.resolve(snapshotRaw);
        const dest = path.resolve(destRaw);
        const dryRun = values['dry-run'];
        const kind = values.format;

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
      'Export a JSON snapshot to the filesystem',
    )
    .defaultCommand('create')
    .parseAsync();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
