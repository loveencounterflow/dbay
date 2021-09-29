(function() {
  'use strict';
  var CND, Dbay_query, Dbay_random, E, FS, H, PATH, SQL, badge, debug, echo, guy, help, info, isa, new_bsqlt3_connection, rpr, type_of, types, urge, validate, validate_list_of, warn, whisper;

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

  types = new (require('intertype')).Intertype();

  ({isa, type_of, validate, validate_list_of} = types.export());

  SQL = String.raw;

  guy = require('guy');

  E = require('./errors');

  new_bsqlt3_connection = require('better-sqlite3');

  H = require('./helpers');

  //...........................................................................................................
  ({Dbay_random} = require('./random-mixin'));

  ({Dbay_query} = require('./query-mixin'));

  //-----------------------------------------------------------------------------------------------------------
  types.declare('constructor_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      },
      "@isa.nonempty_text x.path": function(x) {
        return this.isa.nonempty_text(x.path);
      },
      "@isa.boolean x.temporary": function(x) {
        return this.isa.boolean(x.temporary);
      }
    }
  });

  //===========================================================================================================
  this.Dbay = (function() {
    class Dbay extends Dbay_query(Dbay_random()) {
      //---------------------------------------------------------------------------------------------------------
      static cast_sqlt_cfg(self) {
        /* Produce a configuration object for `better-sqlite3` from `self.cfg`. */
        var R;
        R = guy.obj.pluck_with_fallback(self.cfg, null, 'readonly', 'timeout');
        R.fileMustExist = !self.cfg.create;
        delete self.cfg.create;
        return R;
      }

      //---------------------------------------------------------------------------------------------------------
      static cast_constructor_cfg(self) {
        var R, clasz, filename;
        clasz = self.constructor;
        R = self.cfg;
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
          filename = self._get_random_filename();
          R.path = PATH.resolve(PATH.join(clasz.C.autolocation, filename));
        }
        return R;
      }

      //---------------------------------------------------------------------------------------------------------
      static declare_types(self) {
        /* called from constructor via `guy.cfg.configure_with_types()` */
        self.cfg = this.cast_constructor_cfg(self);
        self.sqlt_cfg = this.cast_sqlt_cfg(self);
        self.cfg = guy.lft.freeze(guy.obj.omit_nullish(self.cfg));
        self.sqlt_cfg = guy.lft.freeze(guy.obj.omit_nullish(self.sqlt_cfg));
        self.types.validate.constructor_cfg(self.cfg);
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      constructor(cfg) {
        super();
        guy.cfg.configure_with_types(this, cfg, types);
        this._register_schema('main', this.cfg.path, this.cfg.temporary);
        //.......................................................................................................
        if (!this.constructor._skip_sqlt) {
          guy.props.def(this, 'sqlt1', {
            enumerable: false,
            value: this._new_bsqlt3_connection()
          });
          guy.props.def(this, 'sqlt2', {
            enumerable: false,
            value: this._new_bsqlt3_connection()
          });
        }
        // @_compile_sql()
        // @_create_sql_functions()
        // @_create_db_structure()
        guy.process.on_exit(() => {
          return this.destroy();
        });
        return void 0;
      }

      //---------------------------------------------------------------------------------------------------------
      _new_bsqlt3_connection() {
        return new_bsqlt3_connection(this.cfg.path, this.sqlt_cfg);
      }

      //---------------------------------------------------------------------------------------------------------
      _register_schema(schema, path, temporary) {
        if (this._dbs == null) {
          /* Register a schema and descriptional properties, especially whether DB file is to be removed on
             process exit. */
          guy.props.def(this, '_dbs', {
            enumerable: false,
            value: {}
          });
        }
        this._dbs[schema] = {path, temporary};
        return null;
      }

      //=========================================================================================================
      // CLEANUP ON DEMAND, ON PROCESS EXIT
      //---------------------------------------------------------------------------------------------------------
      destroy() {
        var d, error, ref, schema;
        try {
          /* To be called on progress exit or explicitly by client code. Removes all DB files marked 'temporary'
             in `@_dbs`. */
          this.sqlt1.close();
        } catch (error1) {
          error = error1;
          warn('^dbay@1^', error.message);
        }
        try {
          this.sqlt2.close();
        } catch (error1) {
          error = error1;
          warn('^dbay@1^', error.message);
        }
        ref = this._dbs;
        for (schema in ref) {
          d = ref[schema];
          if (d.temporary) {
            H.unlink_file(d.path);
          }
        }
        return null;
      }

    };

    //---------------------------------------------------------------------------------------------------------
    Dbay.C = guy.lft.freeze({
      autolocation: H.autolocation,
      defaults: {
        constructor_cfg: {
          // _temp_prefix: '_dba_temp_'
          readonly: false,
          create: true,
          timeout: 5000,
          //...................................................................................................
          overwrite: false,
          path: null
        }
      }
    });

    return Dbay;

  }).call(this);

}).call(this);

//# sourceMappingURL=main.js.map