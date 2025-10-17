/**
 * Provides {@link toTree a function} to dump the contents of a `Volume`,
 * comparing it to the real filesystem.
 *
 * Portions of this code adapted from
 * https://github.com/streamich/memfs/blob/2c6a6ca55ad2e661f40e488fe5ea4087438bae0e/src/print/index.ts#L6-L30
 * and are copyrighted by the original author and licesned under Apache-2.0.
 */

import type { Volume } from 'memfs';
import type { IDirent } from 'memfs/lib/node/types/misc.js';

import nodeFs, { type Dirent } from 'node:fs';
import path from 'node:path';
import { basename, sep } from 'path/posix';
import { printTree } from 'tree-dump';

export const toTree = (
  fs: Volume,
  {
    depth = 10,
    separator = sep,
    dir = separator,
    formatNew = (str) => `+ ${str}`,
    formatOverwrite = (str) => `! ${str}`,
    tab = '',
  }: ToTreeOptions,
) => {
  if (dir[dir.length - 1] !== separator) {
    dir += separator;
  }
  let subtree = ' (...)';
  if (depth > 0) {
    const list = fs.readdirSync(dir, { withFileTypes: true }) as IDirent[];
    let actualFiles: Map<string, Dirent>;
    try {
      actualFiles = new Map(
        nodeFs
          .readdirSync(dir, { withFileTypes: true })
          .map((entry) => [entry.name, entry]),
      );
    } catch {
      actualFiles = new Map();
    }
    subtree = printTree(
      tab,
      list.map((entry) => (tab) => {
        if (entry.isDirectory()) {
          return toTree(fs, {
            depth: depth - 1,
            dir: `${dir}${entry.name}`,
            formatNew,
            formatOverwrite,
            tab,
          });
        }
        let formattedName: string;
        let willBeOverwritten = false;
        const willBeCreated = !actualFiles.has(`${entry.name}`);
        if (!willBeCreated) {
          const actualDirent = actualFiles.get(`${entry.name}`)!;
          if (entry.isSymbolicLink()) {
            if (!actualDirent.isSymbolicLink()) {
              willBeOverwritten = true;
            } else {
              try {
                const actualRealpath = nodeFs.realpathSync(
                  path.join(dir, `${entry.name}`),
                );
                const realpath = fs.readlinkSync(
                  path.join(dir, `${entry.name}`),
                );
                if (actualRealpath !== realpath) {
                  willBeOverwritten = true;
                }
              } catch {
                willBeOverwritten = true;
              }
            }
          } else {
            // implies file
            if (!actualDirent.isFile()) {
              willBeOverwritten = true;
            } else {
              try {
                const actualStat = nodeFs.statSync(
                  path.join(dir, `${entry.name}`),
                );
                const stat = fs.statSync(path.join(dir, `${entry.name}`));
                if (actualStat.size !== stat.size) {
                  willBeOverwritten = true;
                }
              } catch {
                willBeOverwritten = true;
              }
            }
          }
        }
        if (willBeOverwritten) {
          formattedName = formatOverwrite(`${entry.name}`);
        } else if (willBeCreated) {
          formattedName = formatNew(`${entry.name}`);
        } else {
          // identical, hopefully
          formattedName = `${entry.name}`;
        }
        if (entry.isSymbolicLink()) {
          return `${formattedName} → ${fs.readlinkSync(path.join(dir, `${entry.name}`))}`;
        } else {
          return formattedName;
        }
      }),
    );
  }
  const base = basename(dir, separator) + separator;
  return base + subtree;
};

export interface ToTreeOptions {
  depth?: number;
  dir?: string;
  formatNew?: (str: string) => string;
  formatOverwrite?: (str: string) => string;
  separator?: typeof sep;
  tab?: string;
}
