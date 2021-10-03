

## API


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Module: Main](#module-main)
- [Module: Open-close](#module-open-close)
- [Module: Query](#module-query)
- [Module: Random](#module-random)
- [Module: Tx](#module-tx)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


### Module: Main

### Module: Open-close

### Module: Query

* **`walk: ( sql, P... ) ->`**: Iterate over rows in the result set. The query must return values.
* **`all_rows: ( sql, P... ) ->`**: Return a list with all rows.
* **`first_row: ( sql, P... ) ->`**: Return first row of the result set. This will call `db.all_rows()`, so
  may be inefficient when the query returns a large number of rows; best used together with `limit 1`. In
  case the query did not yield any rows, `db.first_row()` will return `null`.
* **`single_row: ( sql, P... ) ->`**: Return the only row of the result set. Like `db.first_row()`, but will
  throw an error if the size of the result set is not exactly 1.
* **`first_values: ( sql, P... ) ->`**: Walk over all 'first' value of the rows of the result set, i.e. the
  field that is mentioned first in a `select ... from ...` query.
* **`all_first_values: ( sql, P... ) ->`**: Same as `db.first_values()`, but returns a list of values.
* **`single_value: ( sql, P... ) ->`**: Given a query that returns a single field in a single row, return
  its value. Throws an error if the query didn't return a single row or the row doesn't have a single field.

### Module: Random

### Module: Tx

