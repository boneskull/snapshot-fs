#!/usr/bin/env node
/**
 * Writes a DirectoryJSON object or snapshot (with --binary flag) to file.
 *
 * For use with memfs.
 *
 * @module snapshot-fs/cli
 * @see {@link https://npm.im/memfs}
 */

import { writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { createDirectoryJson, createSnapshot } from './index.js';

function showHelp() {
  console.log(`
  snapshot-fs [options..] <dir> [dest.json]

  Writes a DirectoryJSON object or snapshot
  (with --binary flag) to file. For use with memfs

  Options:

    --binary/-b     - Output memfs JSON snapshot
    --root/-r       - DirectoryJSON root (default: /)
    --help/-h       - Show this help message
`);
}

async function main(): Promise<void> {
  const {
    positionals,
    values: { help, binary, root },
  } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      binary: { type: 'boolean', short: 'b' },
      root: { type: 'string', short: 'r' },
    },
  });

  if (help) {
    showHelp();
    return;
  }

  if (!positionals.length) {
    console.error('Not enough arguments');
    showHelp();
    process.exitCode = 1;
    return;
  }

  if (positionals.length > 2) {
    console.error('Too many arguments');
    showHelp();
    process.exitCode = 1;
    return;
  }
  const [dir, dest] = positionals;

  const output: string = binary
    ? await createSnapshot({ dir })
    : await createDirectoryJson({ dir, root });

  if (dest) {
    await writeFile(dest, output, 'utf-8');
    console.error(
      '[INFO] Wrote %s of %s to %s',
      binary ? 'snapshot' : 'DirectoryJSON',
      dir,
      dest,
    );
  } else {
    console.log(output);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
