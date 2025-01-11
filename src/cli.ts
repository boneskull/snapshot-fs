/**
 * Writes a DirectoryJSON object or snapshot (with --binary flag) to file.
 *
 * For use with memfs.
 *
 * @module snapshot-fs/cli
 * @see {@link https://npm.im/memfs}
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { createDirectoryJson, createSnapshot } from './index.js';

async function main(): Promise<void> {
  const {
    positionals,
    values: { binary, help, root },
  } = parseArgs({
    allowPositionals: true,
    options: {
      binary: { short: 'b', type: 'boolean' },
      help: { short: 'h', type: 'boolean' },
      root: { short: 'r', type: 'string' },
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
    await mkdir(path.dirname(dest), { recursive: true });
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

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
