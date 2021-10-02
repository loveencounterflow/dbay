

## Benchmarks


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Takeaways](#takeaways)
  - [SQLite is Fast](#sqlite-is-fast)
  - [SQLite is Not Fast Except When It Is](#sqlite-is-not-fast-except-when-it-is)
- [Top Runners](#top-runners)
- [Midfield](#midfield)
- [Also-Rans](#also-rans)
- [To Do](#to-do)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Takeaways

#### SQLite is Fast

The (preliminary) benchmark results (see below; code found at
[dbay/inserts.benchmarks](https://github.com/loveencounterflow/hengist/blob/master/dev/dbay/src/inserts.benchmarks.coffee).
demonstrate that

* **SQLite can do RDBMS stuff faster than some of its competitors** (notably: PostgreSQL);
  * this is no doubt helped by the in-process nature of SQLite as opposed to the server/client architecture
    of more traditional RDBMSes.
* **You can get top speed out of SQLite under NodeJS using
  [`better-sqlite3`](https://github.com/JoshuaWise/better-sqlite3)**, provided that
  * SQLite is **configured correctly** (recommended to always use `pragma journal_mode = WAL`), and
  * **explicit transactions (below marked `*_tx`) are used** to bundle many small actions (here: SQL
    `insert`s) into atomic commits.


#### SQLite is Not Fast Except When It Is

There are, confusingly, several 'operational modes' to run SQLite:

* **(1)** The **classical way** is of course to pass in a file system path that SQLite will use to open an
  existing or create a new database file.
* **(2)** One can **open a DB situated on a RAM disk** (read: Linux `ramfs` or `tmpfs`; also **`sh`**ared
  **`m`**emory). **Opening a DB file on a RAM disk has many advantages** over using any of they ways listed
  under (3), below, since a RAM disk is just a file system, meaning the file can be accessed by all the
  usual means.
* **(3)** Last but not least there are no less than *three* competing, *almost* equivalent ways to obtain an
  **in-memory DB**:
  * **(3.1)** One can pass in the special string [`':memory:'` to obtain a so-called *in-memory DB* (without
    'shared cache')](https://www.sqlite.org/inmemorydb.html),
  * **(3.2)** or an empty string `''` that opens [a *temporary DB* (again without 'shared
    cache')](https://www.sqlite.org/inmemorydb.html#temp_db) (which is almost but not 100% the same thing as
    an in-memory DB).
  * **(3.3)** The third (and in theory preferable) way to open a DB that resides in RAM is using [a
    connection URL like with
    `file:xxx?mode=memory&cache=shared`](https://www.sqlite.org/sharedcache.html#inmemsharedcache) instead
    of a plain filename; since such an in-memory DB is identified via a name, several connections to the
    *same* in-memory DB may be made (albeit only from the same client process).
    * Having more than one connection to the same DB is necessary to enable user-defined functions (UDFs) to
      issue queries against the DB, but
    * the downside is that shared connections lacks feature-parity with [WAL
      mode](https://sqlite.org/wal.html) and that
    * [the 'shared connection' feature is not loved by the SQLite
      devs](https://sqlite.org/forum/info/871b9085849abd6e) (quoting drh: "It was a clever work-around [...]
      shared-cache is considered a mistake and a misfeature").

If the above litany is confusing for you that's because it is. Why *three* distinct, non-obvious ways to
obtain an in-memory DB?—Other than "That's the accumulated results of over 20 years of development" there's
probably no very good answer.

However, after much experimenting, benchmarking and feture-testing, I feel confident to state that **you
should probably forget about using SQLite in-memory DBs as outlined in point (3)**, above. The only
exception to the rule would be when you wanted top performance (and who wouldn't), not worry about explicit
transactions, do not need data durability (i.e. when the DB may become disposable on process exit), and do
not plan on having to use more than a single connection (meaning you can not query data in that DB from
within UDFs). In that case, feel free to pass in an empty string or `':memory:'` as path; but otherwise:

**Always just use ordinary file system paths**. If you're on Linux, consider to use `/dev/shm` which is a
read-to-use `tmpfs`, or use something like `sudo mount -t tmpfs -o size=512m none /mnt/ramdisk` to obtain a
new RAM disk. On Linux systems that have a directory called `/dev/shm`, DBay will use that location to open
DB files when no explicit `path` is passed in, and fall back to `/tmp` when `/dev/shm` is not found. You'll
get to use [WAL mode](https://sqlite.org/wal.html) which is great because together with multiple connections
it enables user-defined functions that can concurrently query rows from the same DB they deliver values to.

What's more, benchmarks indicate that **what is slowing down work with an SQLite DB is not so much file
system access *per se*, it's the implicit transactions that wrap each and every statement** in a pair of
`begin transaction`, `commit` statements. **Curiously, slowdown-by-transaction is much more pronounced with
RAM disks than SSDs**, as shown by the paltry `bsqlt_tmpfs 8.9%` result. I have no explanation for that
performance cliff other than that maybe disk writes are better managed between hardware components and
threads when using SSDs.





### Top Runners

80% — 100%

```
bsqlt_tmpfs_tx          45,595 Hz ≙ 1 ÷ 1.0       100.0 % │████████████▌│
dbay_tmpfs_prep_tx1     44,830 Hz ≙ 1 ÷ 1.0        98.3 % │████████████▎│
bsqlt_tmpfs_tx_jmwal    44,610 Hz ≙ 1 ÷ 1.0        97.8 % │████████████▎│
bsqlt_fle_tx            44,328 Hz ≙ 1 ÷ 1.0        97.2 % │████████████▏│
bsqlt_mem_tx            44,251 Hz ≙ 1 ÷ 1.0        97.1 % │████████████▏│
bsqlt_mem_tx_jmwal      43,679 Hz ≙ 1 ÷ 1.0        95.8 % │████████████ │
bsqlt_fle_tx_jmwal      43,182 Hz ≙ 1 ÷ 1.1        94.7 % │███████████▉ │
```

### Midfield

20% — 80%

```
bsqlt_mem_jmwal         35,612 Hz ≙ 1 ÷ 1.3        78.1 % │█████████▊   │
bsqlt_mem_thrds         35,412 Hz ≙ 1 ÷ 1.3        77.7 % │█████████▊   │
bsqlt_mem               35,132 Hz ≙ 1 ÷ 1.3        77.1 % │█████████▋   │
sqljs_tx                28,640 Hz ≙ 1 ÷ 1.6        62.8 % │███████▉     │
dbay_naive_tx1          25,099 Hz ≙ 1 ÷ 1.8        55.0 % │██████▉      │
bsqlt_tmpfs_qtforum2    20,979 Hz ≙ 1 ÷ 2.2        46.0 % │█████▊       │
bsqlt_fle_qtforum2      16,907 Hz ≙ 1 ÷ 2.7        37.1 % │████▋        │
bsqlt_tmpfs_jmwal       13,830 Hz ≙ 1 ÷ 3.3        30.3 % │███▊         │
pgmem                   12,682 Hz ≙ 1 ÷ 3.6        27.8 % │███▌         │
bsqlt_fle_jmwal         11,670 Hz ≙ 1 ÷ 3.9        25.6 % │███▎         │
pgmem_tx                11,664 Hz ≙ 1 ÷ 3.9        25.6 % │███▎         │
```

### Also-Rans

0% — 20%

```
bsqlt_tmpfs              4,337 Hz ≙ 1 ÷ 10.5        9.5 % │█▎           │
dbay_naive_tx0           3,455 Hz ≙ 1 ÷ 13.2        7.6 % │█            │
sqljs                    1,864 Hz ≙ 1 ÷ 24.5        4.1 % │▌            │
porsagerpostgres_tx      1,058 Hz ≙ 1 ÷ 43.1        2.3 % │▎            │
briancpg_tx                960 Hz ≙ 1 ÷ 47.5        2.1 % │▎            │
```


### To Do

* **[–]** explain different benchmarks scenarios




