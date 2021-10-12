(function() {
  'use strict';
  var CND, DBay_ctx, DBay_openclose, DBay_query, DBay_random, DBay_sqlgen, DBay_stdlib, DBay_udf, E, FS, H, PATH, SQL, Sql, badge, debug, echo, guy, help, info, new_bsqlt3_connection, rpr, types, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'DBAY/MAIN';

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

  types = require('./types');

  SQL = String.raw;

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

  ({DBay_random} = require('./random-mixin'));

  ({DBay_udf} = require('./udf-mixin'));

  ({Sql} = require('./sql'));

  //===========================================================================================================
  this.DBay = (function() {
    class DBay extends DBay_query(DBay_ctx(DBay_openclose(DBay_stdlib(DBay_sqlgen(DBay_random(DBay_udf(Function))))))) {
      //---------------------------------------------------------------------------------------------------------
      static cast_sqlt_cfg(me) {
        /* Produce a configuration object for `better-sqlite3` from `me.cfg`. */
        var R;
        R = guy.obj.pluck_with_fallback(me.cfg, null, 'readonly', 'timeout');
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
          filename = me._get_random_filename();
          R.path = PATH.resolve(PATH.join(clasz.C.autolocation, filename));
        }
        return R;
      }

      //---------------------------------------------------------------------------------------------------------
      static declare_types(me) {
        /* called from constructor via `guy.cfg.configure_with_types()` */
        me.cfg = this.cast_constructor_cfg(me);
        me.sqlt_cfg = this.cast_sqlt_cfg(me);
        me.cfg = guy.lft.freeze(guy.obj.omit_nullish(me.cfg));
        me.sqlt_cfg = guy.lft.freeze(guy.obj.omit_nullish(me.sqlt_cfg));
        me.types.validate.constructor_cfg(me.cfg);
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      constructor(cfg) {
        super('...P', 'return this._me.do(...P)');
        this._me = this.bind(this);
        this._me.state = guy.lft.freeze({});
        this._me.sql = new Sql();
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
        if (typeof this._$random_initialize === "function") {
          this._$random_initialize();
        }
        if (typeof this._$udf_initialize === "function") {
          this._$udf_initialize();
        }
        guy.cfg.configure_with_types(this._me, cfg, types);
        //.......................................................................................................
        guy.props.def(this._me, '_dbs', {
          enumerable: false,
          value: {}
        });
        this._me._register_schema('main', this._me.cfg.path, this._me.cfg.temporary);
        if (!this.constructor._skip_sqlt) {
          guy.props.def(this._me, 'sqlt1', {
            enumerable: false,
            value: this._me._new_bsqlt3_connection()
          });
          guy.props.def(this._me, 'sqlt2', {
            enumerable: false,
            value: this._me._new_bsqlt3_connection()
          });
        }
        if (typeof this._compile_sql === "function") {
          this._compile_sql();
        }
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
        var d, error, ref, ref1, ref2, schema;
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
        try {
          if ((ref1 = this.sqlt2) != null) {
            ref1.close();
          }
        } catch (error1) {
          error = error1;
          warn('^dbay/main@2^', error.message);
        }
        ref2 = this._dbs;
        for (schema in ref2) {
          d = ref2[schema];
          if (d.temporary) {
            H.unlink_file(d.path);
          }
        }
        return null;
      }

    };

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
          path: null
        },
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
          exclude: null
        }
      }
    });

    return DBay;

  }).call(this);

}).call(this);

//# sourceMappingURL=main.js.map