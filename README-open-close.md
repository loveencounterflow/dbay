
## Opening and Closing DBs


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Opening / Attaching DBs](#opening--attaching-dbs)
- [Closing / Detaching DBs](#closing--detaching-dbs)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


### Opening / Attaching DBs

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

### Closing / Detaching DBs






