

## SQL Processing Helpers


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Purpose](#purpose)
- [Escaping Identifiers, General Values, and List Values](#escaping-identifiers-general-values-and-list-values)
- [Statement Interpolation](#statement-interpolation)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Purpose

* Facilitate the creation of securely escaped SQL literals.
* In general not thought of as a replacement for the value interpolation offered by `DBay::prepare()`,
  `DBay::query()` and so, except when
  * one wants to parametrize DB object names (e.g. use table or column names like variables),
  * one wants to interpolate an SQL `values` list, as in `select employee from employees where department in
    ( 'sales', 'HR' );`.

### Escaping Identifiers, General Values, and List Values

* **`db.sql.I: ( name ): ->`**: returns a properly quoted and escaped SQL **I**dentifier.
* **`db.sql.L: ( x ): ->`**: returns a properly quoted and escaped SQL **V**alue. Note that booleans
  (`true`, `false`) will be converted to `1` and `0`, respectively.
* **`db.sql.V: ( x ): ->`**: returns a bracketed SQL list of values (using `db.sql.V()` for each list
  element).


### Statement Interpolation

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

