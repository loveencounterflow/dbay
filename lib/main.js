(function() {
  'use strict';
  var DBay_ctx, DBay_openclose, DBay_query, DBay_sqlgen, DBay_sqlx, DBay_stdlib, DBay_udf, E, FS, GUY, GUY_LEGACY, H, PATH, Random, Sql, alert, debug, echo, guy, help, info, inspect, log, new_bsqlt3_connection, plain, praise, rpr, types, urge, warn, whisper;

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('DBAY'));

  ({rpr, inspect, echo, log} = GUY.trm);

  //...........................................................................................................
  PATH = require('path');

  FS = require('fs');

  types = require('./types');

  guy = require('guy');

  new_bsqlt3_connection = require('better-sqlite3');

  //...........................................................................................................
  E = require('./errors');

  H = require('./helpers');

  ({DBay_query} = require('./query-mixin'));

  ({DBay_ctx} = require('./ctx-mixin'));

  ({DBay_openclose} = require('./open-close-mixin'));

  ({DBay_stdlib} = require('./stdlib-mixin'));

  ({DBay_sqlgen} = require('./sqlgen-mixin'));

  ({Random} = require('./random'));

  ({DBay_udf} = require('./udf-mixin'));

  ({Sql} = require('./sql'));

  ({DBay_sqlx} = require('dbay-sql-macros'));

  GUY_LEGACY = require('guy-legacy');

  //===========================================================================================================
  this.DBay = (function() {
    class DBay extends DBay_query(DBay_ctx(DBay_openclose(DBay_stdlib(DBay_sqlgen(DBay_udf(Function)))))) {
      //---------------------------------------------------------------------------------------------------------
      static cast_sqlt_cfg(me) {
        /* Produce a configuration object for `better-sqlite3` from `me.cfg`. */
        var R;
        R = guy.props.pluck_with_fallback(me.cfg, null, 'readonly', 'timeout');
        R.fileMustExist = !me.cfg.create;
        delete me.cfg.create;
        return R;
      }

      //---------------------------------------------------------------------------------------------------------
      static cast_constructor_cfg(me, cfg = null) {
        var R, clasz, filename;
        clasz = me.constructor;
        R = cfg != null ? cfg : me.cfg;
        //.......................................................................................................
        if (R.path != null) {
          if (R.temporary == null) {
            R.temporary = false;
          }
          R.path = PATH.resolve(R.path);
        } else {
          if (R.temporary == null) {
            R.temporary = true;
          }
          filename = me.rnd.get_random_filename();
          R.path = PATH.resolve(PATH.join(clasz.C.autolocation, filename));
        }
        return R;
      }

      //---------------------------------------------------------------------------------------------------------
      static declare_types(me) {
        /* called from constructor via `guy.cfg.configure_with_types()` */
        me.cfg = this.cast_constructor_cfg(me);
        me.sqlt_cfg = this.cast_sqlt_cfg(me);
        me.cfg = guy.lft.freeze(guy.props.omit_nullish(me.cfg));
        me.sqlt_cfg = guy.lft.freeze(guy.props.omit_nullish(me.sqlt_cfg));
        me.types.validate.constructor_cfg(me.cfg);
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      constructor(cfg) {
        var ref, ref1;
        super('...P', 'return this._me.do(...P)');
        this._me = this.bind(this);
        this._me.state = guy.lft.freeze({});
        this._me.sql = new Sql(this);
        guy.props.hide(this._me, 'rnd', new Random({
          seed: (ref = cfg != null ? cfg.random_seed : void 0) != null ? ref : null,
          delta: (ref1 = cfg != null ? cfg.random_delta : void 0) != null ? ref1 : null
        }));
        if (typeof this._$query_initialize === "function") {
          this._$query_initialize();
        }
        if (typeof this._$ctx_initialize === "function") {
          this._$ctx_initialize();
        }
        if (typeof this._$openclose_initialize === "function") {
          this._$openclose_initialize();
        }
        if (typeof this._$stdlib_initialize === "function") {
          this._$stdlib_initialize();
        }
        if (typeof this._$sqlgen_initialize === "function") {
          this._$sqlgen_initialize();
        }
        if (typeof this._$udf_initialize === "function") {
          this._$udf_initialize();
        }
        if (typeof this._$trash_initialize === "function") {
          this._$trash_initialize();
        }
        GUY_LEGACY.cfg.configure_with_types(this._me, cfg, types);
        //.......................................................................................................
        guy.props.hide(this._me, '_dbs', {});
        guy.props.hide(this._me, 'E', E);
        this._me._register_schema('main', this._me.cfg.path, this._me.cfg.temporary);
        if (!this.constructor._skip_sqlt) {
          guy.props.hide(this._me, 'sqlt1', this._me._new_bsqlt3_connection());
        }
        guy.props.hide(this._me, 'macros', new DBay_sqlx());
        if (typeof this._compile_sql === "function") {
          this._compile_sql();
        }
        /* make `alt` an on-demand clone of present instance: */
        guy.props.def_oneoff(this._me, 'alt', {
          enumerable: false
        }, () => {
          return new this.constructor(this._me.cfg);
        });
        // @create_stdlib() if @_me.cfg.create_stdlib
        // @_create_sql_functions()
        // @_create_db_structure()
        guy.process.on_exit(() => {
          return this._me.destroy();
        });
        return this._me;
      }

      //---------------------------------------------------------------------------------------------------------
      _new_bsqlt3_connection() {
        return new_bsqlt3_connection(this.cfg.path, this.sqlt_cfg);
      }

      //---------------------------------------------------------------------------------------------------------
      _register_schema(schema, path, temporary) {
        /* Register a schema and descriptional properties, especially whether DB file is to be removed on
           process exit. */
        this._dbs[schema] = {path, temporary};
        return null;
      }

      //=========================================================================================================
      // PREPARED STATEMENTS
      //---------------------------------------------------------------------------------------------------------
      // _compile_sql: ->
      //   sql =
      //     _get_field_names: @prepare SQL"select name from #{schema_i}.pragma_table_info( $name );"
      //     statement.raw true

        //=========================================================================================================
      // CLEANUP ON DEMAND, ON PROCESS EXIT
      //---------------------------------------------------------------------------------------------------------
      destroy() {
        var d, error, ref, ref1, schema;
        try {
          /* To be called on progress exit or explicitly by client code. Removes all DB files marked 'temporary'
             in `@_dbs`. */
          if ((ref = this.sqlt1) != null) {
            ref.close();
          }
        } catch (error1) {
          error = error1;
          warn('^dbay/main@1^', error.message);
        }
        ref1 = this._dbs;
        for (schema in ref1) {
          d = ref1[schema];
          if (d.temporary) {
            H.unlink_file(d.path);
          }
        }
        return null;
      }

    };

    //---------------------------------------------------------------------------------------------------------
    /* This function is meant to be used to explicitly mark up SQL literals as in
     constructs like `for row from db SQL"select * from ..."`. The markup can help text editors to provided
     syntax hiliting and other language-specific features for embedded SQL strings. */
    DBay.SQL = H.SQL;

    //---------------------------------------------------------------------------------------------------------
    DBay.C = guy.lft.freeze({
      autolocation: H.autolocation,
      symbols: {
        execute: Symbol('execute')
      },
      defaults: {
        //.....................................................................................................
        constructor_cfg: {
          // _temp_prefix: '_dba_temp_'
          readonly: false,
          create: true,
          timeout: 5000,
          //...................................................................................................
          overwrite: false,
          path: null,
          random_seed: null,
          random_delta: null,
          //...................................................................................................
          macros: false
        },
        // create_stdlib:  true
        //.....................................................................................................
        dbay_with_transaction_cfg: {
          mode: 'deferred'
        },
        //.....................................................................................................
        dba_open_cfg: {
          schema: null,
          path: null
        },
        // overwrite:  false
        // create:     true
        //.....................................................................................................
        dbay_create_function_cfg: {
          deterministic: true,
          varargs: false,
          directOnly: false
        },
        //.....................................................................................................
        dbay_create_aggregate_function_cfg: {
          deterministic: true,
          varargs: false,
          directOnly: false,
          start: null
        },
        //.....................................................................................................
        dbay_create_window_function_cfg: {
          deterministic: true,
          varargs: false,
          directOnly: false,
          start: null
        },
        //.....................................................................................................
        dbay_create_table_function_cfg: {
          deterministic: true,
          varargs: false,
          directOnly: false
        },
        //.....................................................................................................
        dbay_create_virtual_table_cfg: {},
        //.....................................................................................................
        dbay_create_insert_cfg: {
          schema: 'main',
          into: null,
          fields: null,
          exclude: null,
          returning: null
        },
        //.....................................................................................................
        dbay_execute_file_cfg: {
          path: null,
          encoding: 'utf-8'
        },
        //.....................................................................................................
        dba_dt_now_cfg: {
          subtract: null,
          add: null
        }
      }
    });

    return DBay;

  }).call(this);

  guy.props.hide(this.DBay, 'new_bsqlt3_connection', new_bsqlt3_connection);

}).call(this);

//# sourceMappingURL=main.js.map