/* eslint-disable @typescript-eslint/ban-ts-comment */

import { fileURLToPath } from 'url';

// @ts-ignore - for tshy
export const TEST_ROOT = fileURLToPath(new URL('.', import.meta.url));
