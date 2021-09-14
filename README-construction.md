
## ICQL-DBA Constructor

* In order to construct (instantiate) a DBA object, you can call the constructor without any arguments:

  ```coffee
  { Dba } = require 'icql-dba'
  dba     = new Dba()
  ```

  The `dba` object will then have a property `dba.sqlt` that is a `better-sqlite3` connection to an
  in-memory DB (a RAM DB in our terminology).

* You can also call the constructor with a configuration object that may have one or more of the following
  fields:

  * **`cfg.ram`** (`?boolean`): Specifies whether a RAM DB is to be opened. All ICQL-DBA in-memory DBs are
    named so several

    * When neither **`cfg.path`** nor **`cfg.dbnick`** are given, an empty RAM DB will be opened.
    * When **`cfg.dbnick`** (but not **`cfg.path`**) is given, a
    * When **`cfg.path`** is given, an SQLite DB file will be (created if non-existant and) opened; then,
      the DB will be mirrored to RAM so now you have a RAM DB associated with a disk location. You can use
      `dba.save()` any number of times to write changes to disk. DB contents will be lost should the process
      terminate after changes to the DB but before `dba.save()` terminates. This mode of operation is called
      'Eventual Persistency'.



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

|    nr    |          in.ram         |     in.path     |   in.dbnick    |                out.error                 |
| -------- | ----------------------- | --------------- | -------------- | ---------------------------------------- |
| 4, 8, 12 | `null`, `false`, `true` | **`'db/path'`** | **`'dbnick'`** | **E01 cannot give both `path` and `dbnick`** |


|  nr  |  in.ram |  in.path   |     in.dbnick      |            out.error            |
| ---- | ------- | ---------- | ------------------ | ------------------------------- |
| 5, 6 | `false` | **`null`** | `null`, `'dbnick'` | **E02 missing argument `path`** |


|   nr  |      in.ram     |   in.path   | in.dbnick  | out.ram |   out.path  |      out.dbnick      | out.persistency |
| ----- | --------------- | ----------- | ---------- | ------- | ----------- | -------------------- | --------------- |
| 1, 9  | `null`, `true`  | `null`      | `null`     | `true`  | `null`      | `'_icql_6200294332'` | none            |
| 2, 10 | `null`, `true`  | `null`      | `'dbnick'` | `true`  | `null`      | `'dbnick'`           | none            |
| 3, 7  | `null`, `false` | `'db/path'` | `null`     | `false` | `'db/path'` | `null`               | continuous      |
| 11    | `true`          | `'db/path'` | `null`     | `true`  | `'db/path'` | `'_icql_6200294332'` | eventual        |


URL: of the form
* `file:_icql_6200294332?mode=memory&cache=shared` when generated, or
* `file:dbnick?mode=memory&cache=shared` where `dbnick` is given.



