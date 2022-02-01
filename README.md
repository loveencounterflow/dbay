

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
      - [`SQL` Tag Function for Better Embedded Syntax](#sql-tag-function-for-better-embedded-syntax)
      - [Executing SQL](#executing-sql)
    - [User-Defined Functions (UDFs)](#user-defined-functions-udfs)
    - [Standard Library of SQL Functions (StdLib)](#standard-library-of-sql-functions-stdlib)
      - [List of Functions](#list-of-functions)
      - [Use Case for DBay Exceptions and Assertions: Enforcing Invariables](#use-case-for-dbay-exceptions-and-assertions-enforcing-invariables)
      - [Use Case for DBay Variables: Parametrized Views](#use-case-for-dbay-variables-parametrized-views)
    - [Safe Escaping for SQL Values and Identifiers](#safe-escaping-for-sql-values-and-identifiers)
      - [Purpose](#purpose)
      - [Escaping Identifiers, General Values, and List Values](#escaping-identifiers-general-values-and-list-values)
      - [Statement Interpolation](#statement-interpolation)
    - [SQL Statement Generation](#sql-statement-generation)
      - [Insert Statement Generation](#insert-statement-generation)
      - [Insert Statements with a `returning` Clause](#insert-statements-with-a-returning-clause)
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

#### `SQL` Tag Function for Better Embedded Syntax

Mixing SQL and application code has the drawback that instead of editing SQL
in your SQL-aware text editor, now you are editing bland string literals in
your SQL-aware editor. If there only was a way to tell the editor that some
strings contain SQL and should be treated as such!—Well, now there is. The
combined power of [JavaScript Tagged Templates]
(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_template_literals)
and an (exprimental proof-of-concept level) [set of Sublime Text syntax
definitions called `coffeeplus`]
(https://github.com/loveencounterflow/coffeeplus) makes it possible to embed
SQL into JavaScript (and CoffeeScript) source code. The way this works is by
providing a 'tag function' that can be prepended to string literals. The name
of the function together with the ensuing quotes can be recognized by the editor's
hiliter so that constructs like `SQL"..."`, `SQL"""..."""` and so will trigger
switching languages. The tag function does next to nothing; here is its definition:

```coffee
class DBay
  @SQL: ( parts, expressions... ) ->
    R = parts[ 0 ]
    for expression, idx in expressions
      R += expression.toString() + parts[ idx + 1 ]
    return R
```

It can be used like this:

```coffee
{ DBay } = require 'dbay'
{ SQL  } = DBay

db = new DBay { path: 'path/to/db.sqlite', }

for row from db SQL"select id, name, price from products order by 1;"
              #    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
              #    imagine proper embedded hiliting etc here
  console.log row.id, row.name, row.price
```

Be aware that `coffeeplus` is more of an MVP than a polished package. As such, not
even reckognizing backticks has been implemented yet so is probably best used
with CoffeeScript.


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
  insert.run [ 2, 'second', ]
```



------------------------------------------------------------------------------------------------------------

### User-Defined Functions (UDFs)

▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊
▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊
▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊▌▊

------------------------------------------------------------------------------------------------------------


### Standard Library of SQL Functions (StdLib)

#### List of Functions

* Strings
  * **`std_str_reverse()`**
  * **`std_str_join()`**
  * **`std_str_split()`**
  * **`std_str_split_re()`**
  * **`std_str_split_first()`**
  * **`std_re_matches()`**

* XXX
  * **`std_generate_series()`**

* Output
  * **`std_echo()`**
  * **`std_debug()`**
  * **`std_info()`**
  * **`std_warn()`**

* Exceptions and Assertions
  * **`std_raise( message )`**—unconditionally throw an error with message given.
  * **`std_raise_json( facets_json )`**—unconditionally throw an error with informational properties encoded
    as a JSON string.
  * **`std_assert( test, message )`**—throw an error with `message` if `test` is falsy.
  * **`std_warn_if( test, message )`**—print an error `message` if `test` is truthy.
  * **`std_warn_unless()`**—print an error `message` if `test` is falsy.

* Variables
  * **`std_getv()`**
  * **`std_variables()`**

#### Use Case for DBay Exceptions and Assertions: Enforcing Invariables

* `std_assert: ( test, message ) ->` throws error if `test` is false(y)
* `std_warn_unless: ( test, message ) ->` prints warning if `test` is false(y)
* often one wants to ensure a given SQL statement returns / affects exactly zero or one rows
* easy to do if some rows are affected, but more difficult when no rows are affected, because a function in
  the statement won't be called when there are no rows.
* The trick is to ensure that at least one row is computed even when no rows match the query, and the way to
  do that is to include an aggregate function such as `count(*)`.
* May want to include `limit 1` where appropriate.

```sql
select
    *,
    std_assert(
      count(*) > 0,
      '^2734-1^ expected one or more rows, got ' || count(*) ) as _message
  from nnt
  where true
    and ( n != 0 );
```

```sql
select
    *,
    std_assert(
      count(*) > 0, -- using `count(*)` will cause the function to be called
                    -- even in case there are no matching rows
      '^2734-2^ expected one or more rows, got ' || count(*) ) as _message
  from nnt
  where true
    and ( n != 0 )
    and ( t = 'nonexistant' ); -- this condition is never fulfilled
```

#### Use Case for DBay Variables: Parametrized Views

* An alternative for user-defined table functions where those functions would perform queries against the
  DB, which is tricky.
* Inside the view definition, use `std_getv( name )` to retrieve variable values *which must have been set
  immediately prior to accessing the view*.
* Downside is that it's easy to forget to update a given value, so best done from inside a specialized
  method in your application.

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
repetitive chore.

#### Insert Statement Generation

To pick one case in point, SQL `insert` statements when called from a procedural language have a nasty habit
of demanding not two, but *three* copies of a table's column names:

```coffee
db SQL"""
  create table xy (
    a   integer not null primary key,
    b   text not null,
    c   boolean not null );"""
db SQL"insert into xy ( b, c ) values ( $b, $c )", { b, c, }
#                     ^^^^^^^^        ^^^^^^^^^^   ^^^^^^^^^
```

<details><summary><ins>As stated above, DBay does not strive to implement full SQL statement generation.
Even if one wanted to only generate SQL <code>insert</code> statements, one would still have to implement
almost all of SQL, as is evidenced by the screenshot of the <a
href=https://sqlite.org/lang_insert.html>SQLite <code>insert</code> Statement Railroad Diagram</a> that will
be displayed when clicking/tapping on this paragraph.</ins></summary> <img alt='SQLite Insert Statement
Railroad Diagram'
src=https://loveencounterflow.github.io/hengist/sqlite-syntax-diagrams/insert.railroad.png> </details>

Instead, we implement facilities to cover the most frequent use cases and offer opportunities to insert SQL
fragments at strategic points.

Often, when an `insert` statement is being called for, one wants to insert full rows (minus `generate`d
columns, for which see below) into tables. This is the default that DBay makes easy: A call to
`db.prepare_insert()` with the insertion target identified with `into` will return a prepared statement that
can then be used as first argument to the `db` callable:

```coffee
insert_into_xy = db.prepare_insert { into: 'xy', }
db insert_into_xy, { a, b, c, }
```

Observe that named parameters (as opposed to positional ones) are used, so values must be passed as an
object (as opposed to a list).

In case the actual SQL text of the statement is needed, call `db.create_insert()` instead:

```coffee
insert_sql = db.create_insert { into: 'xy', }
# 'insert into "main"."xy" ( "a", "b", "c" ) values ( $a, $b, $c );'
```

When one or more columns in a table are [`autoincrement`ed](https://sqlite.org/autoinc.html) or have a
`default` value, then those columns are often intended not to be set explicitly. What's more, [columns with
`generate`d values]() *must not* be set explicitly. For this reason, **`db.create_insert()` (and, by
extension, `db.prepare_insert()`) will skip `generate`d columns** and allow to explicitly specify either
*included* columns (as `fields`) or else *excluded* columns (as `exclude`):

```coffee
db SQL"""
  create table t1(
    a integer primary key,
    b integer,
    c text,
    d integer generated always as (a*abs(b)) virtual,
    e text generated always as (substr(c,b,b+1)) stored );"""
insert_into_t1 = db.create_insert { into: 't1', }

### Observe `d` and `e` are left out because they're generated, but `a` is present: ###
# 'insert into "main"."t1" ( "a", "b", "c" ) values ( $a, $b, $c );'

### You probably want either this: ###
insert_into_t1 = db.create_insert { into: 't1', fields: [ 'b', 'c', ], }
# 'insert into "main"."t1" ( "b", "c" ) values ( $b, $c );'

### Or this: ###
insert_into_t1 = db.create_insert { into: 't1', exclude: [ 'a', ], }
# 'insert into "main"."t1" ( "b", "c" ) values ( $b, $c );'
```

> There's a subtle yet important semantic difference in how the `fields` and `exclude` settings are handled:
> When `fields` are explicitly given, the table **does not have to exist** when generating the SQL; however,
> when `fields` is not given, the table **must already exist** at the time of calling `create_insert()`.
>
> In either case, `prepare_insert()` can only succeed when all referenced object in an SQL statement have
> already been created.

The next important thing one often wants in inserts is resolving conflicts. DBay `create_insert()` supports
setting `on_conflict` to either **(1)** an arbitrary string that should spell out a syntactically valid SQL
`on conflict` clause, or **(2)** an object `{ update: true, }` to generate SQL that updates the explicitly
or implicitly selected columns. This form has been chosen to leave the door open to future expansions of
supported features.

When choosing the first option, observe that whatever string is passed in, `create_insert()` will prepend
`'on conflict '` to it; therefore, to create an insert statement that ignores insert conflicts, and
according to the [`upsert` syntax railroad diagram](https://sqlite.org/lang_upsert.html): —

![](artwork/upsert.railroad.svg)

— the right thing to do is to call `db.create_insert { into: table_name, on_conflict: 'do nothing', }`.
Assuming table `t1` has been declared as above, calling

```coffee
db.create_insert { into: 't1', exclude: [ 'a', ], on_conflict: "do nothing", }
```

will generate the (unformatted but properly escaped) equivalent to:

```sql
insert into main.t1 ( b, c )
  values ( $b, $c )
  on conflict do nothing;
  --          |<------>|
  --        inserted string
```

while calling

```coffee
db.create_insert { into: 't1', exclude: [ 'a', ], on_conflict: { update: true, }, }
```

wiil generate the (unformatted but properly escaped) equivalent to:

```sql
insert into main.t1 ( b, c )
  values ( $b, $c )
  on conflict do update set  --| conflict resolution clause
    b = excluded.b,          --| mandated by { update: true, }
    c = excluded.c;          --| containing same fields as above
```

#### Insert Statements with a `returning` Clause

It is sometimes handy to have `insert` statements that return a useful value. Here's a toy example
that demonstrates how one can have a table with generated columns:

```coffee
db SQL"""
  create table xy (
    a   integer not null primary key,
    b   text not null,
    c   text generated always as ( '+' || b || '+' ) );"""
insert_into_xy_sql = db.create_insert { into: 'xy', on_conflict: SQL"do nothing", returning: '*', }
# -> 'insert into "main"."xy" ( "a", "b" ) values ( $a, $b ) on conflict do nothing returning *;'
db.single_row insert_into_xy_sql, { a: 1, b: 'any', } # -> { a: 1, b: 'any', c: '+any+' }
db.single_row insert_into_xy_sql, { a: 2, b: 'duh', } # -> { a: 2, b: 'duh', c: '+duh+' }
db.single_row insert_into_xy_sql, { a: 3, b: 'foo', } # -> { a: 3, b: 'foo', c: '+foo+' }
```

Generally, the `returning` clause must be defined by a non-empty string that is valid SQL for the position
after `returning` and the end of the statement. A star `*` will return the entire row that has been
inserted; we here use `db.single_row()` to eschew the result iterator that would be returned by default.


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
  * **[–]** Observe that, seemingly, only *table-valued* UDFs hang while with shared-cache we already *can*
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
* **[+]** let `db.do()` accept prepared statement objects.
* **[–]** implement escaping of dollar-prefixed SQL placeholders (needed by `create_insert()`).
* **[–]** implement
  * **[–]** `db.commit()`
  * **[–]** `db.rollback()`
* **[–]** allow to use sets with `sql.V()`
* **[+]** make `first_row()`, `all_rows()` etc accept statements and strings
* **[+]** at the moment we use `cfg.prefix` for (inherently schema-less) UDF names (and require a trailing
  underscore to be part of the prefix), and `cfg.schema` for plugin-in-specific DB tables and views; in the
  future, we should use a single parameter for both (and make the underscore implicit). In addition, it
  should be possible to choose whether a plugin will create its objects with a prefix (in the same schema as
  the main DB) or within another schema.
* **[+]** fix generated SQL `insert` statements without explicit fields
* **[–]** implement export/snapshot function that generates a DB with a simplified structure:
  * replace generated fields, results from function calls by constants
  * remove `strict` and similar newer attributes
  * DB should be readable by tools like `sqlite3` command line, [`visualize-sqlite`](https://lib.rs/crates/visualize-sqlite)


