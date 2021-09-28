
## DBay Object Construction

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Using Defaults](#using-defaults)
- [Automatic Location](#automatic-location)
- [Randomly Chosen Filename](#randomly-chosen-filename)
- [Using Parameters](#using-parameters)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Using Defaults

In order to construct (instantiate) a DBay object, you can call the constructor without any arguments:

```coffee
{ Dbay }  = require 'dbay'
db        = new Dbay()
```

The `db` object will then have two properties `db.sqlt1` and `db.sqlt2` that are `better-sqlite3`
connections to the same temporary DB in the ['automatic location'](#automatic-location).

### Automatic Location

The so-called 'automatic location' is either

* the directory `/dev/shm` on Linux systems that support **SH**ared **M**emory (a.k.a a RAM disk)
* the OS's temporary directory as announced by `os.tmpdir()`

In either case, a file with a random name will be created in that location.

### Randomly Chosen Filename

Format `dbay-XXXXXXX-XXXXX-XXXXXXX.XXXX.sqlite`

### Using Parameters

You can also call the constructor with a configuration object that may have one or more of the following
fields:

* **`cfg.location`** (`?non-empty text`): specifies a directory to use; by default, this will be the
  ['automatic location'](#automatic-location). It is an error to use `cfg.location` and `cfg.path` together.
  When not specified, `cfg.location` will be derived from `cfg.path`.

* **`cfg.name`** (`?non-empty text`): file name for a DB to be constructed in the directory indicated by
  `cfg.location`. It is an error to use `cfg.name` and `cfg.path` together. When not specified, `cfg.name`
  will be derived from `cfg.path`. The default will be a [randomly chosen
  filename](#randomly-chosen-filename).

* **`cfg.path`** (`?non-empty text`): Specifies which file system path to save the DB to; if the path given
  is relative, it will be resolved in reference to the current directory (`process.cwd()`). It is an error
  to use `cfg.path` and `cfg.location` or `cfg.name` together. When not specified, `cfg.path` will be either
  derived from `cfg.name` and/or `cfg.path`;


