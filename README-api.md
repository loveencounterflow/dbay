<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [API](#api)
  - [Module: Tx](#module-tx)
  - [Module: Query](#module-query)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->





## API
### Module: Tx
### Module: Query

* **`walk: ( sql, P... ) ->`**: Iterate over rows in the result set. The query must return values.
* **`all_rows: ( sql, P... ) ->`**: Return a list with all rows.
* **`first_row: ( sql, P... ) ->`**: Return first row of the result set. This will call `db.all_rows()`, so
  may be inefficient when the query returns a large number of rows; best used together with `limit 1`. In
  case the query did not yield any rows, `db.first_row()` will return `null`.
* **`single_row: ( sql, P... ) ->`**: Return the only row of the result set. Like `db.first_row()`, but will
  throw an error if the size of the result set is not exactly 1.

.rw-rw-r-- 1  5,505 flow flow 2021-10-03 16:06 errors.coffee
.rw-rw-r-- 1  2,119 flow flow 2021-09-29 17:32 helpers.coffee
.rw-rw-r-- 1  6,362 flow flow 2021-10-03 14:14 main.coffee
.rw-rw-r-- 1  2,066 flow flow 2021-10-03 14:31 open-close-mixin.coffee
.rw-rw-r-- 1  3,905 flow flow 2021-10-03 16:09 query-mixin.coffee
.rw-rw-r-- 1  2,615 flow flow 2021-10-03 14:29 random-mixin.coffee
.rw-rw-r-- 1  5,789 flow flow 2021-10-03 15:52 tx-mixin.coffee
.rw-rw-r-- 1 25,969 flow flow 2021-10-03 13:42 types.coffee

