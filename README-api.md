

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

### Module: Random

### Module: Tx

