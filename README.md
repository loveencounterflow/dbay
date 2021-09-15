# DBay


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Under Construction](#under-construction)
- [Introduction](#introduction)
- [Documentation](#documentation)
- [Note on Package Structure](#note-on-package-structure)
  - [`better-sqlite3` an 'Unsaved' Dependency](#better-sqlite3-an-unsaved-dependency)
- [Use npm, Not pnpm](#use-npm-not-pnpm)
- [To Do](#to-do)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Under Construction

DBay is the successor to and a re-write of [icql-dba](https://github.com/loveencounterflow/icql-dba) which
you'll probably want to use for the time being until this package reaches MVP.

## Introduction

DBay provides
* In-Process,
* In-Memory & File-Based
* Relational Data Processing
* for NodeJS
* with SQLite;
* being based on [`better-sqlite3`](https://github.com/JoshuaWise/better-sqlite3),
* it works (almost) exclusively in a synchronous fashion.

## Documentation

* [`Dbay` object construction](./README-construction.md)

## Note on Package Structure

### `better-sqlite3` an 'Unsaved' Dependency

Since DBay depends on [`better-sqlite3`](https://github.com/JoshuaWise/better-sqlite3) with a
[custom-configured build of the SQLite C
engine](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/compilation.md), it is (for whatever
reason) important that **`better-sqlite3` must not be listed under `package.json#dependencies`**; otherwise,
compilation will not work properly. The [build script](./build-sqlite3) will run `npm install
better-sqlite3@'^7.4.3'` but with an added `--no-save` flag.

## Use npm, Not pnpm

Also, at the time of this writing (2021-09), while the project compiles fine using npm v7.21.1 (on NodeJS
v16.9.1 on Linux Mint), but it fails using pnpm v6.14.6 for unknown reasons. Yarn has not been tried.

## To Do

* **[–]** port foundational code from hengist &c
* **[–]** at construction time, allow `dbnick` when `path` is given and `ram` is `false`
