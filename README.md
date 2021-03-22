<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [ICQL-DBA](#icql-dba)
  - [Special Powers](#special-powers)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Usage: Gotchas](#usage-gotchas)
  - [API](#api)
    - [API: Debugging](#api-debugging)
    - [API: Query Result Adapters](#api-query-result-adapters)
    - [API: Querying](#api-querying)
    - [API: Other](#api-other)
    - [API: DB Structure Reporting](#api-db-structure-reporting)
    - [API: DB Structure Modification](#api-db-structure-modification)
    - [API: In-Memory Processing](#api-in-memory-processing)
    - [API: SQL Construction](#api-sql-construction)
    - [API: Sortable Lists](#api-sortable-lists)
    - [Properties](#properties)
  - [Todo](#todo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


# ICQL-DBA

**Your Slogan Here**

## Special Powers

* makes it easy to attach temporary / memory DBs ('schemas') and do all the heavy lifting in RAM, resulting
  in [unexcelled performance](citation needed (forthcoming))
* provides a somewhat more streamlined interface to working with an RDBMS when compared to other tools in
  the field like [`better-sqlite3`](https://github.com/JoshuaWise/better-sqlite3) (which has good reasons to
  stick very close to SQLite3 to be sure)

## Installation

```bash
npm install icql-dba
```

## Usage

### Usage: Gotchas

* When looping over the return value of a DB query like `dba.query sql, parameters`, remember that
  **`dba.query()` returns an iterator over result rows**, not a list (a JS `Array` instance) of values;
  consequently,
  * in CoffeeScript, write `for row` **`from`** `dba.query ...` instead of `for row in dba.query ...`
  * in JavaScript, write `for ( row` **`of`** `dba.query( ... ) )` instead of an indexed loop).
* As long as the iterator is not exhausted (i.e. hasn't finished walking over rows), the DB connection is
  considered busy and cannot write to the DB. Therefore, **one cannot alter data in the DB while iterating
  over rows**. Instead, first retrieve all result rows as a list, and loop over that list; this can be
  conveniently done with `for row` **`in`** **`dba.list`** `dba.query ...`.

## API

### API: Debugging

### API: Query Result Adapters

Query result adapters are convenience methods to transform the result set. Because they exhaust the iterator
that is returned from a `query`, only a single method may be used; if you have to iterate more than once
over a given result set, use `dba.all_rows db.my_query ...`.

* **`dba.limit             n, iterator`**—returns an iterator over the first `n` rows;
* **`dba.list              iterator`**—returns a list of all rows;
* **`dba.single_row        iterator`**—like `first_row`, but throws on `undefined`;
* **`dba.first_row         iterator`**—returns first row, or `undefined`;
* **`dba.single_value      iterator`**—like `first_value`, but throws on `undefined`;
* **`dba.first_value       iterator`**—returns first field of first row, or `undefined`.
* **`dba.first_values      iterator`**—returns an iterator over the first field of all rows.
* **`dba.all_first_values  iterator`**—returns a list with the values of the first field of each row.
  Useful to turn queries like `select product_id from products order by price desc limit 100` into a flat
  list of values.


### API: Querying

* **`dba.prepare sql`**—prepare a statement. Returns a `better-sqlite3` `statement` instance.
* **`dba.execute sql`**—execute any number of SQL statements.
* **`dba.query   sql, P...`**—perform a single `select` statement. Returns an iterator over the resulting
  rows. When the `sql` text has placeholders, accepts additional values.

* run: ( sql, P... ) ->


### API: Other

* `aggregate:      ( P...  ) -> @sqlt.aggregate        P...`
* `backup:         ( P...  ) -> @sqlt.backup           P...`
* `checkpoint:     ( P...  ) -> @sqlt.checkpoint       P...`
* `close:          ( P...  ) -> @sqlt.close            P...`
* `function:       ( P...  ) -> @sqlt.function         P...`
* `load_extension: ( P...  ) -> @sqlt.loadExtension    P...`
* `pragma:         ( P...  ) -> @sqlt.pragma           P...`
* `transaction:    ( P...  ) -> @sqlt.transaction      P...`
* `get_foreign_key_state: -> not not ( @pragma "foreign_keys;" )[ 0 ].foreign_keys`
* `set_foreign_key_state: ( onoff ) ->`

* **`dba.read: ( path )`**—execute SQL statements from a file.
* **`dba.close()`**—close DB.

### API: DB Structure Reporting

* **`dba.walk_objects()`**—return an iterator over all entries in `sqlite_master`; allows to inspect the
  database for all tables, views, and indexes.</strike>
* **`dba.catalog()`**—**deprecated** <strike>return an iterator over all entries in `sqlite_master`; allows
  to inspect the database for all tables, views, and indexes.</strike>

* `list_schemas:       -> @list @query "select * from pragma_database_list order by name;"`
* `list_schema_names:  -> ( d.name for d in @list_schemas() )`
* `type_of: ( name, schema = 'main' ) ->`
* `column_types: ( table ) ->`
* `_dependencies_of: ( table, schema = 'main' ) ->`
* `dependencies_of:  ( table, schema = 'main' ) ->`

### API: DB Structure Modification

* **`dba.clear()`**—drop all tables, views and indexes from the database.
* **`dba.attach( path, schema )`**—attach a given path to a given schema(name); this allows to manage several databases
  with a single connection.

### API: In-Memory Processing

* `copy_schema: ( from_schema, to_schema ) ->`

### API: SQL Construction

* **`dba.escape_text   x`**—turn text `x` into an SQL string literal.
* **`dba.list_as_json  x`**—turn list `x` into a JSON array literal.
* **`dba.as_sql        x`**—express value `x` as SQL literal.
* **`dba.interpolate   sql, Q`**—interpolate values found in object `Q` into string `sql`.

### API: Sortable Lists

* **`as_hollerith:   ( x ) -> HOLLERITH.encode x`**—encode a value with
  [Hollerith-Codec](https://github.com/loveencounterflow/hollerith-codec) (also see
  [Hollerith](https://github.com/loveencounterflow/hollerith))
* **`from_hollerith: ( x ) -> HOLLERITH.decode x`**—decode a Hollerith-encoded value

### Properties

* **`dba.sqlt`**—the underlying `better-sqlite3` object which mediates communication to SQLite3.
* **`dba.cfg`**—the configuration object where per-instance settings are kept.







## Todo

* [ ] provide a way to use JS arrays for SQL values tuples, as in `select * from t where x in ( 2, 3, 5 );`
* [ ] provide a way to notate formats, use raw SQL strings with placeholders, ex. `select * from t where x
  in $tuple:mylist;`, `select * from $name:mytable;`. This could also be used to provide special behavior
  e.g. for the `limit` clause: in PostgreSQL, when `$x` in `select + from t limit $x` is `null`, no limit is
  enforced; however, in SQLite, one has to provide `-1` (or another negative integer) to achieve the same.
  Likewise, `true` and `false` have to be converted to `1` and `0` in SQLite, names in dynamic queries have
  to be quoted and escaped, &c. See https://www.npmjs.com/package/puresql for some ideas for formats; we'll
  probably favor English names over symbols since so many SQLish dialects already use so many conflicting
  sigils like `@` and so on. Named formats could also be provided by user.
* [ ] user defined functions?
* [ ] services like the not-entirely obvious way to get table names with columns out of SQLite (which
  relies on `join`ing rows from `sqlite_master` with rows from `pragma_table_info(...)`)?
* [ ] provide a path to build dynamic SQL; see https://github.com/ianstormtaylor/pg-sql-helpers for some
  ideas.


