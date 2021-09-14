<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [DBay Object Construction](#dbay-object-construction)
  - [All Parameters in Systematic Order](#all-parameters-in-systematic-order)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## DBay Object Construction

* In order to construct (instantiate) a DBay object, you can call the constructor without any arguments:

  ```coffee
  { Dbay }  = require 'dbay'
  dbay      = new Dbay()
  ```

  The `dbay` object will then have a property `dbay.sqlt` that is a `better-sqlite3` connection to an
  in-memory DB (a RAM DB in our terminology).

* You can also call the constructor with a configuration object that may have one or more of the following
  fields:

  * **`cfg.ram`** (`?boolean`): Specifies whether a RAM DB is to be opened. All DBay in-memory DBs are named
    so several connections to the same RAM DB can be opened (this is necessitated by a <del>shortcome</del>
    <ins>feature</ins> of `better-sqlite3` that prohibits any reads against the DB from within User-Defined
    Functions).

    * When neither **`cfg.path`** nor **`cfg.dbnick`** are given, an empty RAM DB will be opened.
    * When **`cfg.dbnick`** (but not **`cfg.path`**) is given, a
    * When **`cfg.path`** is given, an SQLite DB file will be (created if non-existant and) opened; then,
      the DB will be mirrored to RAM so now you have a RAM DB associated with a disk location. You can use
      `dbay.save()` any number of times to write changes to disk. DB contents will be lost should the
      process terminate after changes to the DB but before `dbay.save()` terminates. This mode of operation
      is called 'Eventual Persistency'.

**Note** in the below tables, `in.*` parameters are those passed in when calling `new Dbay { ... }`; `out.*`
parameters are those to be found under `dbay.cfg.*` in the newly constructed instance. Observe that

* where `in.*` parameters are shown with `null` values here they can also be `undefined` or missing;
* where `out.*` parameters are shown with `null` values they will be missing from `dbay.cfg`. This omission
  of `null` values is deemed advantageous for the human reader who will have less text to process when
  printing `dbay.cfg` for introspection, and fewer combinations of values have to be pondered.

In addition to the `out.*` parameters listed, `dbay.cfg.url` will be set whenever `dbnick` is set. This URL
will be of the form
* `file:_icql_6200294332?mode=memory&cache=shared` when generated, or
* `file:your_db_name_here?mode=memory&cache=shared` where `dbnick` is given (as `'your_db_name_here'` in
  this example).


### All Parameters in Systematic Order

For combinations that are unacceptable (cause errors), `out.*` parameters are left unspecified.

|  nr |  in.ram |   in.path   | in.dbnick  | out.ram |   out.path  |      out.dbnick      | out.persistency | out.error | same as  |
| --- | ------- | ----------- | ---------- | ------- | ----------- | -------------------- | --------------- | --------- | -------- |
|   1 | `null`  | `null`      | `null`     | `true`  | `null`      | `'_icql_6200294332'` | none            | ———       | 1, 9     |
|   2 |         |             | `'dbnick'` | `true`  | `null`      | `'dbnick'`           | none            | ———       | 2, 10    |
|   3 |         | `'db/path'` | `null`     | `false` | `'db/path'` | `null`               | continuous      | ———       | 3, 7     |
|   4 |         |             | `'dbnick'` | ———     | ———         | ———                  | ———             | **E01**   | 4, 8, 12 |
|   5 | `false` | `null`      | `null`     | ———     | ———         | ———                  | ———             | **E02**   | 5, 6     |
|   6 |         |             | `'dbnick'` | ———     | ———         | ———                  | ———             | **E02**   | 5, 6     |
|   7 |         | `'db/path'` | `null`     | `false` | `'db/path'` | `null`               | continuous      | ———       | 3, 7     |
|   8 |         |             | `'dbnick'` | ———     | ———         | ———                  | ———             | **E01**   | 4, 8, 12 |
|   9 | `true`  | `null`      | `null`     | `true`  | `null`      | `'_icql_6200294332'` | none            | ———       | 1, 9     |
|  10 |         |             | `'dbnick'` | `true`  | `null`      | `'dbnick'`           | none            | ———       | 2, 10    |
|  11 |         | `'db/path'` | `null`     | `true`  | `'db/path'` | `'_icql_6200294332'` | eventual        | ———       | ———      |
|  12 |         |             | `'dbnick'` | ———     | ———         | ———                  | none            | **E01**   | 4, 8, 12 |

-----------------------

The same as the above, but grouped:

* **A: Parameters that Cause Errors**

|    nr    |          in.ram         |     in.path     |   in.dbnick    |                out.error                 |
| -------- | ----------------------- | --------------- | -------------- | ---------------------------------------- |
| 4, 8, 12 | `null`, `false`, `true` | **`'db/path'`** | **`'dbnick'`** | **E01 cannot give both `path` and `dbnick`** |


|  nr  |  in.ram |  in.path   |     in.dbnick      |            out.error            |
| ---- | ------- | ---------- | ------------------ | ------------------------------- |
| 5, 6 | `false` | **`null`** | `null`, `'dbnick'` | **E02 missing argument `path`** |

|    nr    |          in.ram         |     in.path     |     in.dbnick      |                  out.error                   |
|----------|-------------------------|-----------------|--------------------|----------------------------------------------|
| 4, 8, 12 | `null`, `false`, `true` | **`'db/path'`** | **`'dbnick'`**     | **E01 cannot give both `path` and `dbnick`** |
| 5, 6     | `false`                 | **`null`**      | `null`, `'dbnick'` | **E02 missing argument `path`**              |

* **B: Valid Parameter Combinations**

|   nr  |      in.ram     |   in.path   | in.dbnick  | out.ram |   out.path  |      out.dbnick      | out.persistency |
| ----- | --------------- | ----------- | ---------- | ------- | ----------- | -------------------- | --------------- |
| 1, 9  | `null`, `true`  | `null`      | `null`     | `true`  | `null`      | `'_icql_6200294332'` | none            |
| 2, 10 | `null`, `true`  | `null`      | `'dbnick'` | `true`  | `null`      | `'dbnick'`           | none            |
| 11    | `true`          | `'db/path'` | `null`     | `true`  | `'db/path'` | `'_icql_6200294332'` | eventual        |
| 3, 7  | `null`, `false` | `'db/path'` | `null`     | `false` | `'db/path'` | `null`               | continuous      |




