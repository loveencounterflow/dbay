
## Executing SQL and Queries

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Executing SQL](#executing-sql)
- [API](#api)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Executing SQL

One thing that sets DBay apart from other database adapters is the fact that the object returned from `new
Dbay()` is both the representative of the database opened *and* a callable function. This makes executing
statements and running queries very concise. This is an excerpt from the [DBay test suite]():

```coffee
{ Dbay }            = require H.dbay_path
db                  = new Dbay()
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

### API

* **`walk: ( sql, P... ) ->`**: Iterate over rows in the result set. The query must return values.
* **`all_rows: ( sql, P... ) ->`**: Return a list with all rows.
* **`first_row: ( sql, P... ) ->`**: Return first row of the result set. This will call `db.all_rows()`, so
  may be inefficient when the query returns a large number of rows; best used together with `limit 1`. In
  case the query did not yield any rows, `db.first_row()` will return `null`.
* **`single_row: ( sql, P... ) ->`**: Return the only row of the result set. Like `db.first_row()`, but will
  throw an error if the size of the result set is not exactly 1.



