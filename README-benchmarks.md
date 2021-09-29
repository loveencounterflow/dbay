

## Benchmarks


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Takeaways](#takeaways)
  - [SQLite is Fast](#sqlite-is-fast)
  - [SQLite is Not Fast Except When It Is](#sqlite-is-not-fast-except-when-it-is)
- [Top Runners](#top-runners)
- [Upper League](#upper-league)
- [Also-Rans](#also-rans)
- [Deplorables](#deplorables)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Takeaways

#### SQLite is Fast

The (preliminary) benchmark results (see
[in-memory-sql.benchmarks.coffee](https://github.com/loveencounterflow/hengist/blob/master/dev/in-memory-sql/src/in-memory-sql.benchmarks.coffee),
[in-memory-sql.benchmarks.js](https://github.com/loveencounterflow/hengist/blob/master/dev/in-memory-sql/lib/in-memory-sql.benchmarks.js))
demonstrate that

* **SQLite can do RDBMS stuff faster than some of its competitors (read: PostgreSQL)**;
  * this is no doubt helped by the in-process nature of SQLite as opposed to the server/client architecture
    of more traditional RDBMSes.
* **You can get top speed out of SQLite under NodeJS using
  [`better-sqlite3`](https://github.com/JoshuaWise/better-sqlite3)**, provided that
  * SQLite is **configured correctly** (recommended to always use `pragma journal_mode = WAL`), and
  * **explicit transactions (below marked `*_tx`) are used** to bundle many small actions (here: SQL
    `insert`s).

#### SQLite is Not Fast Except When It Is

There are, confusingly, several 'operational modes' to run SQLite:

* **(1)** The classical way is of course to pass in a file system path that SQLite will use to open an
  existing or create a new database file.
* **(2)**
  * One can also pass in the special string [`':memory:'` to obtain an in-memory
    DB](https://www.sqlite.org/inmemorydb.html),
  * **(2.1)** or an empty string `''` that opens [a temporary
    DB](https://www.sqlite.org/inmemorydb.html#temp_db) (which is almost but not 100% the same thing as an
    in-memory DB).
  * **(2.2)** Another (in theory preferable) way to open a DB that resides in RAM is using [a connection URL
    like with `file:xxx?mode=memory&cache=shared`](https://www.sqlite.org/sharedcache.html#inmemsharedcache)
    instead of a plain filename; since such in-memory are identified via a name, several connections to the
    *same* in-memory DB may be made (albeit only from the same client process).
    * Having more than one connection to the same DB is interesting as it enables user-defined functions
      (UDFs) to issue queries against the DB, but
    * the downside is that shared connections lacks feature-parity with [WAL
      mode](https://sqlite.org/wal.html) and
    * are [not loved by the SQLite devs](https://sqlite.org/forum/info/871b9085849abd6e) (quoting drh: "It
      was a clever work-around [...] shared-cache is considered a mistake and a misfeature").
* **(3)** Last but not least one can **open a DB situated on a RAM disk** (read: Linux `ramfs` or `tmpfs`;
  also **`sh`**ared **`m`**emory). **Opening a DB file on a RAM disk has many advantages** over using any of
  `':memory:'`, `''` or `'file:xxx?mode=memory&cache=shared'` since a RAM disk is just a file system,
  meaning the file can be accessed by all the usual means and ways.

If the above litany is confusing for you that's because it is. Why *three* distinct, non-obvious ways to
obtain an in-memory DB?—Other than "That's the accumulated results of over 20 years of development" there's
probably no very good reason. But to boil it down: best to forget about point **(2)**, just use file system
paths. If you're on Linux, consider to use `/dev/shm` which is a read-to-use `tmpfs`, or use something like
`sudo mount -t tmpfs -o size=512m none /mnt/ramdisk` to obtain a new RAM disk.

### Top Runners

```
bsqlt_mem_tx            44,991 Hz ≙ 1 ÷ 1.0       100.0 % │████████████▌│
bsqlt_tmpfs_tx_jmwal    44,789 Hz ≙ 1 ÷ 1.0        99.6 % │████████████▌│
bsqlt_mem_tx_jmwal      44,757 Hz ≙ 1 ÷ 1.0        99.5 % │████████████▍│
bsqlt_tmpfs_tx          44,538 Hz ≙ 1 ÷ 1.0        99.0 % │████████████▍│
bsqlt_fle_tx            44,255 Hz ≙ 1 ÷ 1.0        98.4 % │████████████▎│
bsqlt_fle_tx_jmwal      44,172 Hz ≙ 1 ÷ 1.0        98.2 % │████████████▎│
```

### Upper League

```
bsqlt_mem               35,666 Hz ≙ 1 ÷ 1.3        79.3 % │█████████▉   │
bsqlt_mem_thrds         35,307 Hz ≙ 1 ÷ 1.3        78.5 % │█████████▊   │
bsqlt_mem_jmwal         35,061 Hz ≙ 1 ÷ 1.3        77.9 % │█████████▊   │
sqljs_tx                27,369 Hz ≙ 1 ÷ 1.6        60.8 % │███████▋     │
```

### Also-Rans

```
bsqlt_tmpfs_qtforum2    20,228 Hz ≙ 1 ÷ 2.2        45.0 % │█████▋       │
bsqlt_fle_qtforum2      16,819 Hz ≙ 1 ÷ 2.7        37.4 % │████▋        │
bsqlt_tmpfs_jmwal       12,829 Hz ≙ 1 ÷ 3.5        28.5 % │███▋         │
pgmem                   12,754 Hz ≙ 1 ÷ 3.5        28.3 % │███▌         │
pgmem_tx                12,214 Hz ≙ 1 ÷ 3.7        27.1 % │███▍         │
bsqlt_fle_jmwal         11,291 Hz ≙ 1 ÷ 4.0        25.1 % │███▏         │
```

### Deplorables

```
bsqlt_tmpfs              3,994 Hz ≙ 1 ÷ 11.3        8.9 % │█▏           │
porsagerpostgres_tx      2,003 Hz ≙ 1 ÷ 22.5        4.5 % │▌            │
sqljs                    1,985 Hz ≙ 1 ÷ 22.7        4.4 % │▌            │
briancpg_tx              1,730 Hz ≙ 1 ÷ 26.0        3.8 % │▌            │
```








