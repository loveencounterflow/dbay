(function() {
  'use strict';
  var CND, E, FS, PATH, SQL, badge, debug, echo, guy, help, info, rpr, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'DBAY/MIXIN/CTX';

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  info = CND.get_logger('info', badge);

  urge = CND.get_logger('urge', badge);

  help = CND.get_logger('help', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  PATH = require('path');

  FS = require('fs');

  E = require('./errors');

  SQL = String.raw;

  guy = require('guy');

  //===========================================================================================================
  // CHECK, GETS, SETS
  //-----------------------------------------------------------------------------------------------------------
  this.DBay_ctx = (clasz = Object) => {
    return class extends clasz {
      //---------------------------------------------------------------------------------------------------------
      _$ctx_initialize() {
        this._me.state = guy.lft.lets(this._me.state, function(d) {
          return d.in_unsafe_mode = false;
        });
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
        this.sqlt2.unsafeMode(onoff);
        this.state = guy.lft.lets(this.state, function(d) {
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
        return null;
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

    };
  };

}).call(this);

//# sourceMappingURL=ctx-mixin.js.map