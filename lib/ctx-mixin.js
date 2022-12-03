(function() {
  'use strict';
  var E, GUY, SQL;

  //###########################################################################################################
  E = require('./errors');

  SQL = String.raw;

  GUY = require('guy');

  //===========================================================================================================
  // CHECK, GETS, SETS
  //-----------------------------------------------------------------------------------------------------------
  this.DBay_ctx = (clasz = Object) => {
    return class extends clasz {
      //---------------------------------------------------------------------------------------------------------
      _$ctx_initialize() {
        this._me.state = GUY.lft.lets(this._me.state, function(d) {
          return d.in_unsafe_mode = false;
        });
        return null;
      }

      //=========================================================================================================
      // JOURNAL MODE
      //---------------------------------------------------------------------------------------------------------
      get_journal_mode() {
        return (this.pragma("journal_mode;"))[0].journal_mode;
      }

      //---------------------------------------------------------------------------------------------------------
      set_journal_mode(journal_mode) {
        this.types.validate.dbay_journal_mode(journal_mode);
        this.pragma(`journal_mode = ${journal_mode};`);
        return null;
      }

      //=========================================================================================================
      // FOREIGN KEYS MODE, DEFERRED
      //---------------------------------------------------------------------------------------------------------
      get_foreign_keys_state() {
        return !!(this.pragma("foreign_keys;"))[0].foreign_keys;
      }

      //---------------------------------------------------------------------------------------------------------
      set_foreign_keys_state(onoff) {
        this.types.validate.boolean(onoff);
        this.pragma(`foreign_keys = ${onoff};`);
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      /* TAINT add schema, table_name; currently only works for main(?) */
      check_foreign_keys() {
        return this.pragma(SQL`foreign_key_check;`);
      }

      //---------------------------------------------------------------------------------------------------------
      set_foreign_keys_deferred(onoff) {
        this.types.validate.boolean(onoff);
        return this.pragma(SQL`defer_foreign_keys=${onoff};`);
      }

      get_foreign_keys_deferred() {
        var ref, ref1;
        return !!((ref = this.pragma(SQL`defer_foreign_keys;`)) != null ? (ref1 = ref[0]) != null ? ref1.defer_foreign_keys : void 0 : void 0);
      }

      //=========================================================================================================
      // UNSAFE MODE
      //---------------------------------------------------------------------------------------------------------
      get_unsafe_mode() {
        return this.state.in_unsafe_mode;
      }

      //---------------------------------------------------------------------------------------------------------
      set_unsafe_mode(onoff) {
        this.types.validate.boolean(onoff);
        this.sqlt1.unsafeMode(onoff);
        this.state = GUY.lft.lets(this.state, function(d) {
          return d.in_unsafe_mode = onoff;
        });
        return null;
      }

      //=========================================================================================================
      // TRANSACTIONS
      //---------------------------------------------------------------------------------------------------------
      within_transaction() {
        return this.sqlt1.inTransaction;
      }

      begin_transaction() {
        return this.sqlt1.exec("begin;");
      }

      commit_transaction() {
        return this.sqlt1.exec("commit;");
      }

      rollback_transaction() {
        return this.sqlt1.exec("rollback;");
      }

      //=========================================================================================================
      // INTEGRITY
      //---------------------------------------------------------------------------------------------------------
      check_integrity() {
        return this.pragma(SQL`integrity_check;`);
      }

      check_quick() {
        return this.pragma(SQL`quick_check;`);
      }

      //=========================================================================================================
      // CONTEXT HANDLERS
      //---------------------------------------------------------------------------------------------------------
      with_transaction(cfg, f) {
        var R, arity, error;
        switch (arity = arguments.length) {
          case 1:
            [cfg, f] = [null, cfg];
            break;
          case 2:
            null;
            break;
          default:
            throw new E.DBay_wrong_arity('^dbay/ctx@4^', 'with_transaction()', 1, 2, arity);
        }
        this.types.validate.dbay_with_transaction_cfg((cfg = {...this.constructor.C.defaults.dbay_with_transaction_cfg, ...cfg}));
        this.types.validate.function(f);
        if (this.sqlt1.inTransaction) {
          throw new E.DBay_no_nested_transactions('^dbay/ctx@5^');
        }
        this.execute(SQL`begin ${cfg.mode} transaction;`);
        error = null;
        try {
          R = f();
        } catch (error1) {
          error = error1;
          if (this.sqlt1.inTransaction) {
            this.execute(SQL`rollback;`);
          }
          throw error;
        }
        try {
          if (this.sqlt1.inTransaction) {
            this.execute(SQL`commit;`);
          }
        } catch (error1) {
          error = error1;
          if (this.sqlt1.inTransaction) {
            this.execute(SQL`rollback;`);
          }
        }
        // try @execute SQL"rollback;" if @sqlt1.inTransaction catch error then null
        return R;
      }

      //---------------------------------------------------------------------------------------------------------
      with_unsafe_mode(f) {
        var R, unsafe_mode_state;
        this.types.validate.function(f);
        unsafe_mode_state = this.get_unsafe_mode();
        this.set_unsafe_mode(true);
        try {
          R = f();
        } finally {
          this.set_unsafe_mode(unsafe_mode_state);
        }
        return R;
      }

      //---------------------------------------------------------------------------------------------------------
      with_foreign_keys_deferred(f) {
        var R;
        this.types.validate.function(f);
        R = null;
        if (this.sqlt1.inTransaction) {
          throw new E.DBay_no_deferred_fks_in_tx('^dbay/ctx@6^');
        }
        this.with_transaction(() => {
          this.sqlt1.pragma(SQL`defer_foreign_keys=true`);
          return R = f();
        });
        return R;
      }

      //=========================================================================================================
      // SHADOW DB FOR CONCURRENT WRITES
      //---------------------------------------------------------------------------------------------------------
      with_shadow(db, handler) {
        var original_path;
        original_path = db.cfg.path;
        GUY.temp.with_shadow_file({
          path: original_path,
          all: true
        }, ({path}) => {
          handler({
            db: new this.constructor({path})
          });
          return db.destroy();
        });
        return new this.constructor({
          path: original_path
        });
      }

      //---------------------------------------------------------------------------------------------------------
      with_concurrent(cfg) {
        switch (cfg.mode) {
          case 'reader':
            return this.with_concurrent_reader(cfg);
          case 'shadow':
            return this.with_concurrent_shadow(cfg);
          default:
            throw new E.DBay_internal_error('^dbay/main@1^', `mode ${rpr(cfg.mode)} not implement`);
        }
      }

      //---------------------------------------------------------------------------------------------------------
      with_concurrent_reader(cfg) {
        var d, i, len, ref;
        ref = this.all_rows(cfg.reader);
        for (i = 0, len = ref.length; i < len; i++) {
          d = ref[i];
          cfg.writer(this, d);
        }
        return this;
      }

      //---------------------------------------------------------------------------------------------------------
      with_concurrent_shadow(cfg) {
        var read_db;
        return this.with_shadow(read_db = this, function({
            db: write_db
          }) {
          write_db(function() {
            var d, ref;
            ref = read_db(cfg.reader);
            for (d of ref) {
              cfg.writer(write_db, d);
            }
            return null;
          });
          return null;
        });
      }

    };
  };

}).call(this);

//# sourceMappingURL=ctx-mixin.js.map