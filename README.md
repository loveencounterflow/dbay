

# 𓆤DBay


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [𓆤DBay](#%F0%93%86%A4dbay)
  - [Introduction](#introduction)
  - [Documentation](#documentation)
    - [Main](#main)
      - [Using Defaults](#using-defaults)
      - [Automatic Location](#automatic-location)
      - [Randomly Chosen Filename](#randomly-chosen-filename)
      - [Using Parameters](#using-parameters)
    - [Opening and Closing DBs](#opening-and-closing-dbs)
      - [Opening / Attaching DBs](#opening--attaching-dbs)
      - [Closing / Detaching DBs](#closing--detaching-dbs)
    - [Transactions and Context Handlers](#transactions-and-context-handlers)
    - [Query](#query)
      - [Executing SQL](#executing-sql)
    - [User-Defined Functions (UDFs)](#user-defined-functions-udfs)
    - [Standard Library of SQL Functions (StdLib)](#standard-library-of-sql-functions-stdlib)
    - [Safe Escaping for SQL Values and Identifiers](#safe-escaping-for-sql-values-and-identifiers)
      - [Purpose](#purpose)
      - [Escaping Identifiers, General Values, and List Values](#escaping-identifiers-general-values-and-list-values)
      - [Statement Interpolation](#statement-interpolation)
    - [SQL Statement Generation](#sql-statement-generation)
    - [Random](#random)
  - [Note on Package Structure](#note-on-package-structure)
    - [`better-sqlite3` an 'Unsaved' Dependency](#better-sqlite3-an-unsaved-dependency)
  - [Use npm, Not pnpm](#use-npm-not-pnpm)
  - [To Do](#to-do)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



# 𓆤DBay

DBay is built on [`better-sqlite3`](https://github.com/JoshuaWise/better-sqlite3), which is a NodeJS adapter
for [SQLite](https://www.sqlite.org). It provides convenient access to in-process, on-file and in-memory
relational databases. <!-- The mascot of DBay is the -->


DBay is the successor to and a re-write of [ICQL-DBA](https://github.com/loveencounterflow/icql-dba). It is
under development and nearing feature-parity with its predecessor while already providing some significant
improvements in terms of ease of use and simplicity of implementation.

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

* **[Benchmarks](./README-benchmarks.md)**

------------------------------------------------------------------------------------------------------------

### Main

#### Using Defaults

In order to construct (instantiate) a DBay object, you can call the constructor without any arguments:

```coffee
{ DBay }  = require 'dbay'
db        = new DBay()
```

The `db` object will then have two properties `db.sqlt1` and `db.sqlt2` that are `better-sqlite3`
connections to the same temporary DB in the ['automatic location'](#automatic-location).

#### Automatic Location

The so-called 'automatic location' is either

* the directory `/dev/shm` on Linux systems that support **SH**ared **M**emory (a.k.a a RAM disk)
* the OS's temporary directory as announced by `os.tmpdir()`

In either case, a [file with a random name](#randomly-chosen-filename) will be created in that location.

#### Randomly Chosen Filename

Format `dbay-NNNNNNNNNN.sqlite`, where `N` is a digit `[0-9]`.

#### Using Parameters

You can also call the constructor with a configuration object that may have one or more of the following
fields:

* **`cfg.path`** (`?non-empty text`): Specifies which file system path to save the DB to; if the path given
  is relative, it will be resolved in reference to the current directory (`process.cwd()`). When not
  specified, `cfg.path` will be derived from [`DBay.C.autolocation`](#automatic-location) and a [randomly
  chosen filename](#randomly-chosen-filename).

* **`cfg.temporary`** (`?boolean`): Specifies whether DB file is to be removed when process exits or
  `db.destry()` is called explicitly. `cfg.temporary` defaults to `false` if `cfg.path` is given, and `true`
  otherwise (when a random filename is chosen).



------------------------------------------------------------------------------------------------------------

### Opening and Closing DBs


#### Opening / Attaching DBs

* **`db.open cfg`**: [Attach](https://www.sqlite.org/lang_attach.html) a new or existing DB to the `db`'s
  connections (`db.sqlt1`, `db.sqlt1`).
* `cfg`:
  * `schema` (non-empty string): Required property that specifies the name under which the newly attached
    DB's objects can be accessed as; having attached a DB as, say, `db.open { schema: 'foo', path:
    'path/to/my.db', }`, one can then run queries like `db "select * from foo.main;"` against it. Observe
    that
    * the DB opened at object creation time (`db = new DBay()`) always has the implicit name `main`, and
      schema `temp` is reserved for temporary databases.
  * `path` (string): FS path to existing or to-be-created DB file; for compatibility, this may also be set
    [to one of the special values that indicates a in-memory
    DB](./README-benchmarks.md#sqlite-is-not-fast-except-when-it-is), although that is not recommended.
  * `temporary` (boolean): Defaults to `false` when a `path` is given, and to `true` otherwise.

* The custom SQLite library that is compiled when installing DBay has its `SQLITE_LIMIT_ATTACHED`
  compilation parameter set to the maximum allowed value of 125 (instead of the default 10). This allows
  developers to assemble a DB application from dozens of smaller pieces when desired.

#### Closing / Detaching DBs

▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊
▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊
▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊



------------------------------------------------------------------------------------------------------------

### Transactions and Context Handlers

▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊
▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊
▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊

------------------------------------------------------------------------------------------------------------

### Query

▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊
▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊
▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊

#### Executing SQL

One thing that sets DBay apart from other database adapters is the fact that the object returned from `new
DBay()` is both the representative of the database opened *and* a callable function. This makes executing
statements and running queries very concise. This is an excerpt from the [DBay test suite]():

```coffee
{ DBay }            = require H.dbay_path
db                  = new DBay()
db ->
  db SQL"drop table if exists texts;"
  db SQL"create table texts ( nr integer not null primary key, text text );"
  db SQL"insert into texts values ( 3, 'third' );"
  db SQL"insert into texts values ( 1, 'first' );"
  db SQL"insert into texts values ( ?, ? );", [ 2, 'second', ]
  #.......................................................................................................
  T?.throws /cannot start a transaction within a transaction/, ->
    db ->
#.........................................................................................................
T?.throws /UNIQUE constraint failed: texts\.nr/, ->
  db ->
    db SQL"insert into texts values ( 3, 'third' );"
#.........................................................................................................
rows = db SQL"select * from texts order by nr;"
rows = [ rows..., ]
T?.eq rows, [ { nr: 1, text: 'first' }, { nr: 2, text: 'second' }, { nr: 3, text: 'third' } ]
```

> **Note** In the above `SQL` has been set to `String.raw` and has no further effect on the string it
> precedes; it is just used as a syntax marker (cool because then you can have nested syntax hiliting).

As shown by [benchmarks](./README-benchmarks.md), a crucial factor for getting maximum performance out of
using SQLite is strategically placed transactions. SQLite will not ever execute a DB query *outside* of a
transaction; when no transaction has been explicitly opened with `begin transaction`, the DB engine will
precede each query implicitly with (the equivalent of) `begin transaction` and follow it with either
`commit` or `rollback`. This means when a thousand `insert` statements are run, a thousand transactions will
be started and committed, leavin performance pretty much in the dust.

To avoid that performance hit, users are advised to always start and commit transactions when doing many
consecutive queries. DBay's callable `db` object makes that easy: just write `db -> many; inserts; here;`
(JS: `db( () -> { many; inserts; here; })`), i.e. pass a function as the sole argument to `db`, and DBay
will wrap that function with a transaction. In case an error should occur, DBay guarantees to call
`rollback` (in a `try ... finally ...` clause). Those who like to make things more explicit can also use
`db.with_transaction ->`. Both formats allow to pass in a configuration object with an attribute `mode` that
may be set to [one of `'deferred'`, `'immediate'`, or
`'exclusive'`](https://www.sqlite.org/lang_transaction.html), the default being `'deferred'`.

Another slight performance hit may be caused by the logic DBay uses to (look up an SQL text in a cache or)
prepare a statement and then decide whether to call `better-sqlite3`'s' `Database::execute()`,
`Statement::run()` or `Statement::iterate()`; in order to circumvent that extra work, users may choose to
fall back on to `better-sqlite3` explicitly:

```coffee
insert = db.prepare SQL"insert into texts values ( ?, ? );" # returns a `better-sqlite3` `Statement` instance
db ->
  insert [ 2, 'second', ]
```



------------------------------------------------------------------------------------------------------------

### User-Defined Functions (UDFs)

▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊
▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊
▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊

------------------------------------------------------------------------------------------------------------


### Standard Library of SQL Functions (StdLib)

▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊
▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊
▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊


------------------------------------------------------------------------------------------------------------

### Safe Escaping for SQL Values and Identifiers


#### Purpose

* Facilitate the creation of securely escaped SQL literals.
* In general not thought of as a replacement for the value interpolation offered by `DBay::prepare()`,
  `DBay::query()` and so, except when
  * one wants to parametrize DB object names (e.g. use table or column names like variables),
  * one wants to interpolate an SQL `values` list, as in `select employee from employees where department in
    ( 'sales', 'HR' );`.

#### Escaping Identifiers, General Values, and List Values

* **`db.sql.I: ( name ): ->`**: returns a properly quoted and escaped SQL **I**dentifier.
* **`db.sql.L: ( x ): ->`**: returns a properly quoted and escaped SQL **V**alue. Note that booleans
  (`true`, `false`) will be converted to `1` and `0`, respectively.
* **`db.sql.V: ( x ): ->`**: returns a bracketed SQL list of values (using `db.sql.V()` for each list
  element).


#### Statement Interpolation

**`db.interpolate( sql, values ): ->`** accepts a template (a string with placeholder formulas) and a list
or object of values. It returns a string with the placeholder formulas replaced with the escaped values.

```coffee
# using named placeholders
sql     = SQL"select $:col_a, $:col_b where $:col_b in $V:choices"
d       = { col_a: 'foo', col_b: 'bar', choices: [ 1, 2, 3, ], }
result  = db.sql.interpolate sql, d
# > """select "foo", "bar" where "bar" in ( 1, 2, 3 )"""
```

```coffee
# using positional placeholders
sql     = SQL"select ?:, ?: where ?: in ?V:"
d       = [ 'foo', 'bar', 'bar', [ 1, 2, 3, ], ]
result  = db.sql.interpolate sql, d
# > """select "foo", "bar" where "bar" in ( 1, 2, 3 )"""
```

```coffee
# using an unknown format
sql     = SQL"select ?:, ?X: where ?: in ?V:"
d       = [ 'foo', 'bar', 'bar', [ 1, 2, 3, ], ]
result  = db.sql.interpolate sql, d
# throws "unknown interpolation format 'X'"
```

------------------------------------------------------------------------------------------------------------


### SQL Statement Generation

DBay offers limited support for the declarative generation of a small number of recurring classes of SQL
statements. These facilities are in no way intended to constitute or grow into a full-blown
Object-Relational Mapper (ORM); instead, they are meant to make working with relational data less of a
chore. To pick one case in point, SQL `insert` statements when called from a procedural language have a
nasty habit of demanding not two, but *three* copies of a table's column names:

```coffee
db SQL"""
  create table xy (
    a   integer not null primary key,
    b   text not null,
    c   boolean not null );"""
db SQL"insert into xy ( b, c ) values ( $b, $c )", { b, c, }
#                     ^^^^^^^^        ^^^^^^^^^^   ^^^^^^^^^
```

Often, when an `insert` statement is being called for, one wants to insert full rows into tables. This is
the default that DBay makes easy: A call to `db.prepare_insert()` with the insertion target identified with
`into` will return a prepared statement that can then be used as first argument to the `db` callable:

```coffee
insert_into_xy = db.prepare_insert { into: 'xy', }
db insert_into_xy, { a, b, c, }
```

Observe that named parameters (as opposed to positional ones) are used, so values must be passed as an
object (as opposed to a list). In case the actual SQL text of the statement is needed, call
`db.create_insert { into: 'xy', }` instead.

Also quite frequent is the case where the values of a few fields need not or should not be explicitly set;
this is commonly the case with [(implicit) `autoincrement` fields](https://sqlite.org/autoinc.html), `a` in
this case. `db.prepare_insert()` allows to either explicitly name the `fields` to be set: —

```coffee
insert_into_xy = db.prepare_insert { into: 'xy', fields: [ 'b', 'c', ], }
db insert_into_xy, { b, c, }
```

— or, alternatively, to specify which fields to `exclude`:

```coffee
insert_into_xy = db.prepare_insert { into: 'xy', exclude: [ 'a', ], }
db insert_into_xy, { b, c, }
```

<svg xmlns='http://www.w3.org/2000/svg' class="pikchr" viewBox="0 0 901.142 363.96">
<path d="M223,165L759,165L759,51L223,51Z"  style="fill:none;stroke-width:3.24;stroke:rgb(211,211,211);" />
<circle cx="5" cy="66" r="3.6"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<polygon points="47,66 35,71 35,62" style="fill:rgb(0,0,0)"/>
<path d="M9,66L41,66"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M62,82L71,82A15 15 0 0 0 86 66A15 15 0 0 0 71 51L62,51A15 15 0 0 0 47 66A15 15 0 0 0 62 82Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="66" y="66" text-anchor="middle" fill="rgb(0,0,0)" dominant-baseline="central">ON</text>
<polygon points="103,66 92,71 92,62" style="fill:rgb(0,0,0)"/>
<path d="M86,66L98,66"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M118,82L193,82A15 15 0 0 0 208 66A15 15 0 0 0 193 51L118,51A15 15 0 0 0 103 66A15 15 0 0 0 118 82Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="156" y="66" text-anchor="middle" fill="rgb(0,0,0)" dominant-baseline="central">CONFLICT</text>
<polygon points="264,97 253,101 253,92" style="fill:rgb(0,0,0)"/>
<path d="M208,66 L 223,66 Q 238,66 238,81 L 238,82 Q 238,97 248,97 L 259,97"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M280,112A15 15 0 0 0 295 97L295,97A15 15 0 0 0 280 82A15 15 0 0 0 264 97L264,97A15 15 0 0 0 280 112Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="280" y="97" text-anchor="middle" font-weight="bold" fill="rgb(0,0,0)" dominant-baseline="central">(</text>
<polygon points="331,97 319,101 319,92" style="fill:rgb(0,0,0)"/>
<path d="M295,97L325,97"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M331,112L475,112L475,82L331,82Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="403" y="97" text-anchor="middle" fill="rgb(0,0,0)" dominant-baseline="central">indexed-column</text>
<polygon points="511,97 500,101 500,92" style="fill:rgb(0,0,0)"/>
<path d="M475,97L506,97"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M526,112A15 15 0 0 0 542 97L542,97A15 15 0 0 0 526 82A15 15 0 0 0 511 97L511,97A15 15 0 0 0 526 112Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="526" y="97" text-anchor="middle" font-weight="bold" fill="rgb(0,0,0)" dominant-baseline="central">)</text>
<polygon points="583,135 572,139 572,130" style="fill:rgb(0,0,0)"/>
<path d="M542,97 L 549,97 Q 557,97 557,112 L 557,119 Q 557,135 567,135 L 577,135"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M598,150L648,150A15 15 0 0 0 663 135A15 15 0 0 0 648 119L598,119A15 15 0 0 0 583 135A15 15 0 0 0 598 150Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="623" y="135" text-anchor="middle" fill="rgb(0,0,0)" dominant-baseline="central">WHERE</text>
<polygon points="680,135 669,139 669,130" style="fill:rgb(0,0,0)"/>
<path d="M663,135L674,135"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M680,150L729,150L729,119L680,119Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="705" y="135" text-anchor="middle" fill="rgb(0,0,0)" dominant-baseline="central">expr</text>
<polygon points="744,108 749,119 740,119" style="fill:rgb(0,0,0)"/>
<path d="M729,135 L 737,135 Q 744,135 744,124 L 744,114"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<polygon points="786,66 774,71 774,62" style="fill:rgb(0,0,0)"/>
<path d="M744,108 L 744,81 Q 744,66 759,66 L 765,66 L 780,66"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M801,82L809,82A15 15 0 0 0 824 66A15 15 0 0 0 809 51L801,51A15 15 0 0 0 786 66A15 15 0 0 0 801 82Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="805" y="66" text-anchor="middle" fill="rgb(0,0,0)" dominant-baseline="central">DO</text>
<polygon points="729,97 718,101 718,92" style="fill:rgb(0,0,0)"/>
<path d="M542,97L723,97"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M729,97 L 737,97 Q 744,97 744,89 L 744,82"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M208,66L774,66"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M403,150A15 15 0 0 0 418 135A15 15 0 0 0 403 119A15 15 0 0 0 388 135A15 15 0 0 0 403 150Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="403" y="135" text-anchor="middle" font-weight="bold" fill="rgb(0,0,0)" dominant-baseline="central">,</text>
<polygon points="418,135 430,130 430,139" style="fill:rgb(0,0,0)"/>
<path d="M475,97 L 483,97 Q 490,97 490,112 L 490,119 Q 490,135 475,135 L 439,135 L 424,135"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M388,135 L 319,135 Q 304,135 304,119 L 304,112 Q 304,97 312,97 L 319,97"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="288" y="36" text-anchor="middle" font-style="italic" fill="rgb(128,128,128)" dominant-baseline="central">conflict target</text>
<polygon points="436,195 447,191 447,199" style="fill:rgb(0,0,0)"/>
<path d="M824,66 L 831,66 Q 839,66 839,81 L 839,180 Q 839,195 824,195 L 456,195 L 441,195"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<polygon points="47,271 35,275 35,266" style="fill:rgb(0,0,0)"/>
<path d="M436,195 L 35,195 Q 20,195 20,210 L 20,256 Q 20,271 31,271 L 41,271"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M62,286L116,286A15 15 0 0 0 131 271A15 15 0 0 0 116 255L62,255A15 15 0 0 0 47 271A15 15 0 0 0 62 286Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="89" y="271" text-anchor="middle" fill="rgb(0,0,0)" dominant-baseline="central">UPDATE</text>
<polygon points="148,271 137,275 137,266" style="fill:rgb(0,0,0)"/>
<path d="M131,271L143,271"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M164,286L179,286A15 15 0 0 0 194 271A15 15 0 0 0 179 255L164,255A15 15 0 0 0 148 271A15 15 0 0 0 164 286Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="171" y="271" text-anchor="middle" fill="rgb(0,0,0)" dominant-baseline="central">SET</text>
<polygon points="257,308 245,313 245,304" style="fill:rgb(0,0,0)"/>
<path d="M194,271 L 215,271 Q 230,271 230,286 L 230,293 Q 230,308 241,308 L 251,308"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M257,324L413,324L413,293L257,293Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="335" y="308" text-anchor="middle" fill="rgb(0,0,0)" dominant-baseline="central">column-name-list</text>
<polygon points="475,271 464,275 464,266" style="fill:rgb(0,0,0)"/>
<path d="M413,308 L 434,308 Q 449,308 449,293 L 449,286 Q 449,271 459,271 L 469,271"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M490,286A15 15 0 0 0 505 271A15 15 0 0 0 490 255A15 15 0 0 0 475 271A15 15 0 0 0 490 286Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="490" y="271" text-anchor="middle" font-weight="bold" fill="rgb(0,0,0)" dominant-baseline="central">=</text>
<polygon points="523,271 511,275 511,266" style="fill:rgb(0,0,0)"/>
<path d="M505,271L517,271"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M523,286L572,286L572,255L523,255Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="547" y="271" text-anchor="middle" fill="rgb(0,0,0)" dominant-baseline="central">expr</text>
<polygon points="619,271 608,275 608,266" style="fill:rgb(0,0,0)"/>
<path d="M572,271L613,271"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M634,286L684,286A15 15 0 0 0 699 271A15 15 0 0 0 684 255L634,255A15 15 0 0 0 619 271A15 15 0 0 0 634 286Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="659" y="271" text-anchor="middle" fill="rgb(0,0,0)" dominant-baseline="central">WHERE</text>
<polygon points="716,271 705,275 705,266" style="fill:rgb(0,0,0)"/>
<path d="M699,271L710,271"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M716,286L765,286L765,255L716,255Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="741" y="271" text-anchor="middle" fill="rgb(0,0,0)" dominant-baseline="central">expr</text>
<polygon points="891,233 880,237 880,228" style="fill:rgb(0,0,0)"/>
<path d="M765,271 L 773,271 Q 780,271 780,256 L 780,248 Q 780,233 795,233 L 871,233 L 886,233"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<circle cx="895" cy="233" r="3.6"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M62,248L130,248A15 15 0 0 0 145 233A15 15 0 0 0 130 218L62,218A15 15 0 0 0 47 233A15 15 0 0 0 62 248Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="96" y="233" text-anchor="middle" fill="rgb(0,0,0)" dominant-baseline="central">NOTHING</text>
<polygon points="47,233 35,237 35,228" style="fill:rgb(0,0,0)"/>
<path d="M20,218 L 20,225 Q 20,233 31,233 L 41,233"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M145,233L880,233"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<polygon points="638,233 626,237 626,228" style="fill:rgb(0,0,0)"/>
<path d="M587,271 L 594,271 Q 602,271 602,256 L 602,248 Q 602,233 617,233 L 617,233 L 632,233"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M383,361A15 15 0 0 0 398 346A15 15 0 0 0 383 331A15 15 0 0 0 368 346A15 15 0 0 0 383 361Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="383" y="346" text-anchor="middle" font-weight="bold" fill="rgb(0,0,0)" dominant-baseline="central">,</text>
<polygon points="398,346 410,342 410,351" style="fill:rgb(0,0,0)"/>
<path d="M572,271 L 579,271 Q 587,271 587,286 L 587,331 Q 587,346 572,346 L 419,346 L 404,346"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<polygon points="206,308 210,320 201,320" style="fill:rgb(0,0,0)"/>
<path d="M368,346 L 221,346 Q 206,346 206,331 L 206,329 L 206,314"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M206,308 L 206,286 Q 206,271 221,271 L 227,271 L 242,271"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<polygon points="257,271 245,275 245,266" style="fill:rgb(0,0,0)"/>
<path d="M194,271L251,271"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M272,286L366,286A15 15 0 0 0 381 271A15 15 0 0 0 366 255L272,255A15 15 0 0 0 257 271A15 15 0 0 0 272 286Z"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<text x="319" y="271" text-anchor="middle" fill="rgb(0,0,0)" dominant-baseline="central">column-name</text>
<path d="M381,271L464,271"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<polygon points="865,97 869,108 860,108" style="fill:rgb(0,0,0)"/>
<path d="M850,233 L 857,233 Q 865,233 865,218 L 865,117 L 865,102"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<polygon points="403,6 415,2 415,10" style="fill:rgb(0,0,0)"/>
<path d="M865,97 L 865,21 Q 865,6 850,6 L 424,6 L 409,6"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
<path d="M403,6 L 40,6 Q 25,6 25,21 L 25,51 Q 25,66 32,66 L 40,66"  style="fill:none;stroke-width:2.16;stroke:rgb(0,0,0);" />
</svg>

------------------------------------------------------------------------------------------------------------

### Random


▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊
▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊
▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊



------------------------------------------------------------------------------------------------------------

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
* **[+]** implement `DBay::do()` as a method that unifies all of `better-sqlite3`'s `Statement::run()`,
  `Statement::iterate()`, and `Database::execute()`.
* **[+]** allow to call `DBay::do -> ...` with a synchronous function with the same semantics as
  `DBay::with_transaction -> ...`.
* **[+]** allow to call `DBay::do { mode: 'deferred', }, -> ...`.
* **[–]** allow to call `DBay::do -> ...` with an asynchronous function
* **[+]** make `db = new DBay()` an instance of `Function` that, when called, runs `DBay::do()`
  `Database::execute()`.
  `statement = DBay::prepare.insert_into.<table> [ 'field1', 'field2', ..., ]`
* **[+]** change classname(s) from `Dbay` to `DBay` to avoid spelling variant proliferation
* **[–]** implement `DBay::open()`, `DBay::close()`
* **[–]** ensure how cross-schema foreign keys work when re-attaching DBs / schemas one by one
* **[–]** demote `random` from a mixin to functions in `helpers`.
* **[–]** implement `db.truncate()` / `db.delete()`; allow to retrieve SQL.
* **[–]** implement `DBay::insert_into.<table> [ 'field1', 'field2', ..., ], { field1, field2, ..., }`;
  allow to retrieve SQL.
* **[–]** clarify whether UDFs get called at all when any argument is `null` b/c it looks like they
  don't get called which would be unfortunate
* **[–]** add schematic to clarify terms like *database*, *schema*, *connection*; hilite that UDFs are
  defined on *connections* (not *schemas* or *databases* as would be the case in e.g. PostgreSQL).
* **[–]** allow to transparently treat key/value tables as caches
* **[–]** let `db.do()` accept prepared statement objects.



