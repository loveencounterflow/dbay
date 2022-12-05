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

      // #=========================================================================================================
      // # SHADOW DB FOR CONCURRENT WRITES
      // #---------------------------------------------------------------------------------------------------------
      // with_shadow: ( db, handler ) ->
      //   throw new E.DBay_not_implemented '^dbay/ctx@7^', "with_shadow()"
      //   original_path = db.cfg.path
      //   bring_along   = [
      //     "#{original_path}-shm"
      //     "#{original_path}-wal"
      //     "#{original_path}-journal" ]
      //   GUY.temp.with_shadow_file { path: original_path, all: true, bring_along, }, ({ path, }) =>
      //     handler { db: ( new @constructor { path, } ), }
      //     db.destroy()
      //   return new @constructor { path: original_path, }

        // #---------------------------------------------------------------------------------------------------------
      // with_concurrent: ( cfg ) ->
      //   return switch cfg.mode
      //     when 'reader' then @with_concurrent_reader cfg
      //     when 'shadow' then @with_concurrent_shadow cfg
      //     else throw new E.DBay_internal_error '^dbay/main@1^', "mode #{rpr cfg.mode} not implement"

        // #---------------------------------------------------------------------------------------------------------
      // with_concurrent_reader: ( cfg ) ->
      //   for d in @all_rows cfg.reader
      //     cfg.writer @, d
      //   return @

        // #---------------------------------------------------------------------------------------------------------
      // with_concurrent_shadow: ( cfg ) ->
      //   return @with_shadow read_db = @, ({ db: write_db, }) ->
      //     write_db ->
      //       for d from read_db cfg.reader
      //         cfg.writer write_db, d
      //       return null
      //     return null

        //---------------------------------------------------------------------------------------------------------
      with_deferred_write(f) {
        var P, buffer, i, len, write;
        buffer = [];
        write = function(...P) {
          return buffer.push(P);
        };
        f(write);
        if (this.within_transaction) {
          for (i = 0, len = buffer.length; i < len; i++) {
            P = buffer[i];
            this(...P);
          }
        } else {
          this(function() {
            var j, len1, results;
            results = [];
            for (j = 0, len1 = buffer.length; j < len1; j++) {
              P = buffer[j];
              results.push(this(...P));
            }
            return results;
          });
        }
        return null;
      }

    };
  };

}).call(this);

//# sourceMappingURL=ctx-mixin.js.map