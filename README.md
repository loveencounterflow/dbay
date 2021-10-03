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

* **[`Dbay` object construction](./README-construction.md)**
* **[Benchmarks](./README-benchmarks.md)**
* **[Executing SQL and Queries](./README-query.md)**
* **[Opening and Closing DBs](./README-open-close.md)**
* **[API](./README-api.md)**

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
v16.9.1 on Linux Mint), but it fails using pnpm v6.14.6 with `Unknown options: 'build-from-source',
'sqlite3'`. Yarn has not been tried.

**Note**—*These considerations only concern those who wish to fork/clone DBay to work on the code. Those who
just want to use DBay as a dependency of their project can both either run `npm install dbay` or `pnpm add
dbay`, both package managers work fine.*

## To Do

* **[–]** port foundational code from hengist &c
* **[–]** at construction time, allow `dbnick` when `path` is given and `ram` is `false`
* **[–]** to solve the table-UDF-with-DB-access conundrum, consider
  * <del>**[+]** https://github.com/mapnik/mapnik/issues/797, where connection parameters are discussed (see also
    https://www.sqlite.org/c3ref/open.html);</del> <ins>nothing of interested AFAICS</ins>
  * **[–]** mirroring a given DB into a second (RAM or file) location, taking care to replay any goings-on
    on both instances. This is probably unattractive from a performance POV.
  * **[–]** using [NodeJS worker threads](https://nodejs.org/api/worker_threads.html) to perform updates;
    maybe one could even continuously mirror a RAM DB on disk to get a near-synchronous copy, obliviating
    the necessity to explicitly call `db.save()`. See
    https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/threads.md
  * **[–]** implementing **macros** so one could write eg `select * from foo( x ) as d;` to get `select *
    from ( select a, b, c from blah order by 1 ) as d` (i.e. inline expansion)
  * **[–]** Obeserve that, seemingly, only *table-valued* UDFs hang while with shared-cache we already *can*
    issue `select`s from inside UDFs, so maybe there's a teeny, fixable difference between how both are
    implemented that leads to the undesirable behavior
* **[–]** let users choose between SQLite-only RAM DBs and `tmpfs`-based in-memory DBs (b/c the latter allow
  `pragma journal_mode = WAL` for better concurrent access). Cons include: `tmpfs`-based RAM DBs necessitate
  mounting a RAM disk which needs `sudo` rights, so might as well just instruct users to mount RAM disk,
  then use that path? Still, it would be preferrable to have some automatic copy-to-durable in place.
* **[–]** implement context handler for discardable / temporary file
* **[+]** implement `Dbay::do()` as a method that unifies all of `better-sqlite3`'s `Statement::run()`,
  `Statement::iterate()`, and `Database::execute()`.
* **[+]** allow to call `Dbay::do -> ...` with a synchronous function with the same semantics as
  `Dbay::with_transaction -> ...`.
* **[+]** allow to call `Dbay::do { mode: 'deferred', }, -> ...`.
* **[–]** allow to call `Dbay::do -> ...` with an asynchronous function
* **[+]** make `db = new Dbay()` an instance of `Function` that, when called, runs `Dbay::do()`
  `Database::execute()`.
* **[–]** implement `Dbay::insert_into.<table> [ 'field1', 'field2', ..., ], { field1, field2, ..., }` and
  `statement = Dbay::prepare.insert_into.<table> [ 'field1', 'field2', ..., ]`
* **[–]** change classname(s) from `Dbay` to `DBay` to avoid spelling variant proliferation
* **[–]** implement `Dbay::open()`, `Dbay::close()`
* **[–]** ensure how cross-schema foreign keys work when re-attaching DBs / schemas one by one

