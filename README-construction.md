
## DBay Object Construction

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Using Defaults](#using-defaults)
- [Automatic Location](#automatic-location)
- [Using Parameters](#using-parameters)
  - [All Parameters in Systematic Order](#all-parameters-in-systematic-order)
  - [Valid Parameter Combinations](#valid-parameter-combinations)
  - [Invalid Parameter Combinations](#invalid-parameter-combinations)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Using Defaults

In order to construct (instantiate) a DBay object, you can call the constructor without any arguments:

```coffee
{ Dbay }  = require 'dbay'
db        = new Dbay()
```

The `db` object will then have two properties `db.sqlt1` and `db.sqlt2` that are `better-sqlite3`
connections to the same temporary DB in the ['automatic location']().

### Automatic Location

The so-called 'automatic location' is either

* the directory `/dev/shm` on Linux systems that support **SH**ared **M**emory (a.k.a a RAM disk)
* the OS's temporary directory as announced by `os.tmpdir()`

In either case, a file with a random name will be created in that location.

### Using Parameters

You can also call the constructor with a configuration object that may have one or more of the following
fields:

* **`cfg.location`** (`?non-empty text`): specifies a directory to use; by default, this will be the ['automatic location']().

* **`cfg.path`** (`?non-empty text`): Specifies which file system path to save the DB to. In case this
  points to a directory, in which case `cfg.name` must also be given.

* **`cfg.name`** (`?URL-safe word`): file name for a DB to be constructed in the ['automatic location'](). It will be used to construct a URL that
  will be passed to SQLite. There's little use in passing in `name` explicitly; if one wishes to
  construct multiple `Dbay()` objects to the same RAM DB, one can always use the `cfg` object of the first
  instance:

  ```coffee
  db1 = new Dbay { ram: true, }
  db2 = new Dbay db1.cfg
  ```

#### All Parameters in Systematic Order

**Note** in the below tables, `in.*` parameters are those passed in when calling `new Dbay { ... }`; `out.*`
parameters are those to be found under `db.cfg.*` in the newly constructed instance. Observe that

* where `in.*` parameters are shown with `null` values here they can also be `undefined` or missing;
* where `out.*` parameters are shown with `null` values they will be missing from `db.cfg`. This omission
  of `null` values is deemed advantageous for the human reader who will have less text to process when
  printing `db.cfg` for introspection, and fewer combinations of values have to be pondered.
* For combinations that are unacceptable (cause errors), `out.*` parameters are left unspecified.

In addition to the `out.*` parameters listed, `db.cfg.url` will be set whenever `name` is set. This URL
will be of the form
* `file:_6200294332?mode=memory&cache=shared` when generated, or
* `file:your_db_name_here?mode=memory&cache=shared` where `name` is given (as `'your_db_name_here'` in
  this example).



| nr |  in.ram |   in.path   | in.name  | out.ram |   out.path  |    out.name   | out.persistency | out.error | same as  |
|----|---------|-------------|------------|---------|-------------|-----------------|-----------------|-----------|----------|
|  1 | `null`  | `null`      | `null`     | `true`  | `null`      | `'_6200294332'` | none            | ———       | 1, 9     |
|  2 |         |             | `'name'` | `true`  | `null`      | `'name'`      | none            | ———       | 2, 10    |
|  3 |         | `'db/path'` | `null`     | `false` | `'db/path'` | `null`          | continuous      | ———       | 3, 7     |
|  4 |         |             | `'name'` | ———     | ———         | ———             | ———             | **E01**   | 4, 8, 12 |
|  5 | `false` | `null`      | `null`     | ———     | ———         | ———             | ———             | **E02**   | 5, 6     |
|  6 |         |             | `'name'` | ———     | ———         | ———             | ———             | **E02**   | 5, 6     |
|  7 |         | `'db/path'` | `null`     | `false` | `'db/path'` | `null`          | continuous      | ———       | 3, 7     |
|  8 |         |             | `'name'` | ———     | ———         | ———             | ———             | **E01**   | 4, 8, 12 |
|  9 | `true`  | `null`      | `null`     | `true`  | `null`      | `'_6200294332'` | none            | ———       | 1, 9     |
| 10 |         |             | `'name'` | `true`  | `null`      | `'name'`      | none            | ———       | 2, 10    |
| 11 |         | `'db/path'` | `null`     | `true`  | `'db/path'` | `'_6200294332'` | eventual        | ———       | ———      |
| 12 |         |             | `'name'` | ———     | ———         | ———             | none            | **E01**   | 4, 8, 12 |



#### Valid Parameter Combinations

|   nr  |      in.ram     |   in.path   | in.name  | out.ram |   out.path  |    out.name   | out.persistency |
|-------|-----------------|-------------|------------|---------|-------------|-----------------|-----------------|
| 1, 9  | `null`, `true`  | `null`      | `null`     | `true`  | `null`      | `'_6200294332'` | none            |
| 2, 10 | `null`, `true`  | `null`      | `'name'` | `true`  | `null`      | `'name'`      | none            |
| 11    | `true`          | `'db/path'` | `null`     | `true`  | `'db/path'` | `'_6200294332'` | eventual        |
| 3, 7  | `null`, `false` | `'db/path'` | `null`     | `false` | `'db/path'` | `null`          | continuous      |

Resulting shapes of `db.cfg` when the above `in.*` parameters are applied; observe that additional
properties may be present:

|   nr  |                                                                                                 |
|-------|-------------------------------------------------------------------------------------------------|
| 1, 9  | `{ ram: true, name: '_6200294332', url: 'file:_6200294332?mode=memory&cache=shared' }`        |
| 2, 10 | `{ ram: true, name: 'name', url: 'file:name?mode=memory&cache=shared' }`                  |
| 11    | `{ ram: true, name: 'name', url: 'file:name?mode=memory&cache=shared', path: 'db/path' }` |
| 3, 7  | `{ ram: false, path: 'db/path' }`                                                               |
|       |                                                                                                 |


#### Invalid Parameter Combinations

* When a `path` is given, `name` must not be set. In the future, we may allow this `name` to be used when
  `db.transfer_to_ram()` is called.
* When `ram` is explicitly `false`, then `path` must be set.

|    nr    |          in.ram         |     in.path     |     in.name      |                  out.error                   |
|----------|-------------------------|-----------------|--------------------|----------------------------------------------|
| 4, 8, 12 | `null`, `false`, `true` | **`'db/path'`** | **`'name'`**     | **E01 cannot give both `path` and `name`** |
| 5, 6     | `false`                 | **`null`**      | `null`, `'name'` | **E02 missing argument `path`**              |








