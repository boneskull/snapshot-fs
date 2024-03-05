#!/usr/bin/env node
// @ts-check

/**
 * Prints (or writes to a file) a `memfs` JSON snapshot from the filesystem
 *
 * @packageDocumentation
 * @see {@link https://npm.im/memfs}
 */

import { writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { createSnapshot } from './index.js';

function showHelp() {
  console.log(`
  snapshot-fs [options..] <dir> <dest.json>

  Creates memfs snapshot from filesystem and saves to a file.
  
  Options:

    --help       - Show this help message
`);
}

async function main() {
  const {
    positionals,
    values: { help, out },
  } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean' },
      out: { type: 'string', short: 'o' },
    },
  });

  if (help) {
    showHelp();
    return;
  }

  if (positionals.length < 2) {
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

  const [target, dest] = positionals;
  const result = await createSnapshot({ dir: target });

  await writeFile(dest, result);

  console.error(`Wrote dir JSON to ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
