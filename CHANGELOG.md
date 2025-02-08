# Changelog

## [5.0.1](https://github.com/boneskull/snapshot-fs/compare/snapshot-fs-v5.0.0...snapshot-fs-v5.0.1) (2025-02-08)


### Bug Fixes

* **docs:** update README with info for v5 ([49e4181](https://github.com/boneskull/snapshot-fs/commit/49e41817327e954bc85eaa20d6c057fa94f72d57))

## [5.0.0](https://github.com/boneskull/snapshot-fs/compare/snapshot-fs-v4.0.0...snapshot-fs-v5.0.0) (2025-02-08)


### ⚠ BREAKING CHANGES

* The CLI options have changed; `--binary` is now replaced by a `--format` option which can be one of `cbor`, `cjson`, or `json`.  The default format is now CJSON, which was what you'd get if you used `--binary` previously.  `json` is `DirectoryJSON` output, which will now print a warning about it being a lossy format.  `cbor` is a pure-binary format (look it up on Wikipedia) and results in smaller files and faster (de-)serialization than CJSON.  `--dir` is now `--source`.  `--json-root` has been removed (and may be restored later).  The `export` subcommand now supports a `--dry-run` flag, which will print what would be exported and how it affects existing files.  Added the `--separator` option, though this needs further testing on Windows.

### Features

* add CBOR support ([#289](https://github.com/boneskull/snapshot-fs/issues/289)) ([e34f86a](https://github.com/boneskull/snapshot-fs/commit/e34f86a65efb9e5330b6737d66cd3d1ffbf2d3a8))

## [4.0.0](https://github.com/boneskull/snapshot-fs/compare/snapshot-fs-v3.1.2...snapshot-fs-v4.0.0) (2025-01-31)


### ⚠ BREAKING CHANGES

* `createSnapshot()` now resolves with a `JsonUint8Array<SnapshotNode>` value instead of a `string`.

### Bug Fixes

* **deps:** remove direct dependency on glob ([c04c976](https://github.com/boneskull/snapshot-fs/commit/c04c976215af5927596b334955d1a8f35e91dfe6))
* **deps:** remove direct dependency on is-binary-path ([a4269b8](https://github.com/boneskull/snapshot-fs/commit/a4269b8661176e203d1b98c450c9c88710fb8732))
* handle symlinks ([56d17b9](https://github.com/boneskull/snapshot-fs/commit/56d17b9247fc09363c3cfbbd77c531299001c181))

## [3.1.2](https://github.com/boneskull/snapshot-fs/compare/snapshot-fs-v3.1.1...snapshot-fs-v3.1.2) (2025-01-27)


### Bug Fixes

* relative path handling ([ac57693](https://github.com/boneskull/snapshot-fs/commit/ac5769383d3cc06a28072651dc8c92998fa68daf))

## [3.1.1](https://github.com/boneskull/snapshot-fs/compare/snapshot-fs-v3.1.0...snapshot-fs-v3.1.1) (2025-01-14)


### Bug Fixes

* **readme:** fix logo link ([e676ad7](https://github.com/boneskull/snapshot-fs/commit/e676ad7747e61d56970cdeb5b44fe1224d12cce7))

## [3.1.0](https://github.com/boneskull/snapshot-fs/compare/snapshot-fs-v3.0.0...snapshot-fs-v3.1.0) (2025-01-14)


### Features

* **export:** support DirectoryJSON exports ([07fb5c4](https://github.com/boneskull/snapshot-fs/commit/07fb5c4e7b92784a1f68ed4fdb37946607784972))


### Bug Fixes

* **cli:** fix unrunnable CLI with binary flag ([55a0788](https://github.com/boneskull/snapshot-fs/commit/55a0788bd27062ae048da763b1dcf158ce0c30af))

## [3.0.0](https://github.com/boneskull/snapshot-fs/compare/snapshot-fs-v2.0.0...snapshot-fs-v3.0.0) (2025-01-14)


### ⚠ BREAKING CHANGES

* **export:** Node.js v22.13.0 is now the minimum version. The CLI commands have changed.

### Features

* **export:** add export subcommand ([74bb944](https://github.com/boneskull/snapshot-fs/commit/74bb9444d546444ae5506758ba240d73fc5cffb8)), closes [#224](https://github.com/boneskull/snapshot-fs/issues/224)

## [2.0.0](https://github.com/boneskull/snapshot-fs/compare/snapshot-fs-v1.0.7...snapshot-fs-v2.0.0) (2025-01-13)


### ⚠ BREAKING CHANGES

* This drops support for Node.js v20.x.

### Bug Fixes

* **deps:** update dependency glob to v11.0.1 ([#246](https://github.com/boneskull/snapshot-fs/issues/246)) ([d39151d](https://github.com/boneskull/snapshot-fs/commit/d39151d20288fc22fb6b5401e7734b21933623a1))
* **deps:** update dependency memfs to v4.16.0 ([#244](https://github.com/boneskull/snapshot-fs/issues/244)) ([a0cae77](https://github.com/boneskull/snapshot-fs/commit/a0cae77c365401bbca8d6480c0be7a11b13a205b))
* **deps:** update dependency memfs to v4.17.0 ([#245](https://github.com/boneskull/snapshot-fs/issues/245)) ([cdb8012](https://github.com/boneskull/snapshot-fs/commit/cdb8012ae23eec54b8cc05b91a0c305996d69404))
* mkdir output file ([2007348](https://github.com/boneskull/snapshot-fs/commit/200734867daf1a0bf142efe3ec660f1da5d6f118)), closes [#223](https://github.com/boneskull/snapshot-fs/issues/223)


### Miscellaneous Chores

* drop support for Node.js v20 ([aaaa6d9](https://github.com/boneskull/snapshot-fs/commit/aaaa6d97ef7d3c99516095bb676d8d2e1d63241d))

## [1.0.7](https://github.com/boneskull/snapshot-fs/compare/snapshot-fs-v1.0.6...snapshot-fs-v1.0.7) (2025-01-06)


### Bug Fixes

* **deps:** update dependency memfs to v4.15.1 ([#226](https://github.com/boneskull/snapshot-fs/issues/226)) ([2ef2abc](https://github.com/boneskull/snapshot-fs/commit/2ef2abcfdc7c7f73461338a2c24145cd12c73e5c))
* **deps:** update dependency memfs to v4.15.2 ([#231](https://github.com/boneskull/snapshot-fs/issues/231)) ([b0f820a](https://github.com/boneskull/snapshot-fs/commit/b0f820aa4ebee7f6382283203f29b9a3f89d9274))
* **deps:** update dependency memfs to v4.15.3 ([#233](https://github.com/boneskull/snapshot-fs/issues/233)) ([b8cb80b](https://github.com/boneskull/snapshot-fs/commit/b8cb80b2204c024965bd4905b863c7b1110787e5))

## [1.0.6](https://github.com/boneskull/snapshot-fs/compare/snapshot-fs-v1.0.5...snapshot-fs-v1.0.6) (2024-12-19)


### Bug Fixes

* **deps:** update dependency memfs to v4.14.1 ([#202](https://github.com/boneskull/snapshot-fs/issues/202)) ([de94b0e](https://github.com/boneskull/snapshot-fs/commit/de94b0e33b8b2725d991b2747abd3d0f9b16f311))
* **deps:** update dependency memfs to v4.15.0 ([#207](https://github.com/boneskull/snapshot-fs/issues/207)) ([c94a33b](https://github.com/boneskull/snapshot-fs/commit/c94a33be3b28fc49a7b54affd935eead48793e01))

## [1.0.5](https://github.com/boneskull/snapshot-fs/compare/snapshot-fs-v1.0.4...snapshot-fs-v1.0.5) (2024-11-25)


### Bug Fixes

* **pkg:** add missing repository field ([492f801](https://github.com/boneskull/snapshot-fs/commit/492f80176c4c35f38359c240f47995112d4225bf))

## [1.0.4](https://github.com/boneskull/snapshot-fs/compare/snapshot-fs-v1.0.3...snapshot-fs-v1.0.4) (2024-11-25)


### Bug Fixes

* **deps:** update dependency memfs to v4.13.0 ([e03461a](https://github.com/boneskull/snapshot-fs/commit/e03461a67d7e1c099aafb2cd5e08870d65637558))
* **deps:** update dependency memfs to v4.14.0 ([4dd20c3](https://github.com/boneskull/snapshot-fs/commit/4dd20c33c5d0a7d409ab769f2fa1a41bf81ab4fe))

## [1.0.3](https://github.com/boneskull/snapshot-fs/compare/snapshot-fs-v1.0.2...snapshot-fs-v1.0.3) (2024-09-23)


### Bug Fixes

* **deps:** update dependency memfs to v4.11.2 ([a6ad437](https://github.com/boneskull/snapshot-fs/commit/a6ad437759c85b422522cfc7959408585ad87684))
* **deps:** update dependency memfs to v4.12.0 ([5ab8dd6](https://github.com/boneskull/snapshot-fs/commit/5ab8dd6e8151a130b98c8ea19b2e1791a6543f04))

## [1.0.2](https://github.com/boneskull/snapshot-fs/compare/snapshot-fs-v1.0.1...snapshot-fs-v1.0.2) (2024-09-09)


### Bug Fixes

* **deps:** update dependency memfs to v4.11.1 ([5a818b9](https://github.com/boneskull/snapshot-fs/commit/5a818b90bf30f3ae9bdcf4b6296c9df28d0164b4))

## [1.0.1](https://github.com/boneskull/snapshot-fs/compare/snapshot-fs-v1.0.0...snapshot-fs-v1.0.1) (2024-08-01)


### Bug Fixes

* **deps:** update dependency glob to v10.3.12 ([da1233d](https://github.com/boneskull/snapshot-fs/commit/da1233d380b7004381d2c114033bf71e83c6a6c4))
* **deps:** update dependency glob to v10.3.13 ([809d2dc](https://github.com/boneskull/snapshot-fs/commit/809d2dc3c29ef9bbbfa320e16da13696e4cb387f))
* **deps:** update dependency glob to v10.3.14 ([8418b2e](https://github.com/boneskull/snapshot-fs/commit/8418b2ebc26bb20138ded2fd7fcae525b193e949))
* **deps:** update dependency glob to v10.3.15 ([eac6a27](https://github.com/boneskull/snapshot-fs/commit/eac6a27780f6c9a863dae971116f31944a2c1f9d))
* **deps:** update dependency glob to v10.3.16 ([c0a2884](https://github.com/boneskull/snapshot-fs/commit/c0a28847bbc4807f8af594e2048c66accd9ad5c3))
* **deps:** update dependency glob to v10.4.5 ([bb154c4](https://github.com/boneskull/snapshot-fs/commit/bb154c413a360f5e6fb0d3a5ed953097cb503613))
* **deps:** update dependency glob to v11 ([23999be](https://github.com/boneskull/snapshot-fs/commit/23999be84062bfeff357e590d6b54e981a7612e4))
* **deps:** update dependency memfs to v4.11.0 ([c25db0a](https://github.com/boneskull/snapshot-fs/commit/c25db0adfc6050bddb846a037a63ec7326dfe1fd))
* **deps:** update dependency memfs to v4.8.1 ([0d3ce09](https://github.com/boneskull/snapshot-fs/commit/0d3ce094bc1a2a0e38ded3fca04654817058fb6a))
* **deps:** update dependency memfs to v4.8.2 ([4e97b5a](https://github.com/boneskull/snapshot-fs/commit/4e97b5a928e6eabfe9e623ed6fdf523aecee3a7e))
* **deps:** update dependency memfs to v4.9.3 ([3b65d87](https://github.com/boneskull/snapshot-fs/commit/3b65d87bd7be03e9fc0ab91d3986fc641670c269))
* **deps:** update dependency memfs to v4.9.4 ([c277355](https://github.com/boneskull/snapshot-fs/commit/c2773552cc9f83b9f4b14322f98473a666270397))
* **package:** rebuild with new tshy ([2e70045](https://github.com/boneskull/snapshot-fs/commit/2e70045a803ff58ed2c959416343e6924db1f6e5))

## 1.0.0 (2024-04-03)


### Features

* all the tools ([58c7f56](https://github.com/boneskull/snapshot-fs/commit/58c7f56459835bea5529d73e0574ab808dc5be9b))
* initial commit ([407e3e1](https://github.com/boneskull/snapshot-fs/commit/407e3e1361c59d707cd0edd54a8b957fac605e9b))


### Bug Fixes

* **deps:** update dependency glob to v10.3.12 ([da1233d](https://github.com/boneskull/snapshot-fs/commit/da1233d380b7004381d2c114033bf71e83c6a6c4))
* **deps:** update dependency memfs to v4.8.1 ([0d3ce09](https://github.com/boneskull/snapshot-fs/commit/0d3ce094bc1a2a0e38ded3fca04654817058fb6a))
