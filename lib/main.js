(function() {
  'use strict';
  var CND, E, FS, H, PATH, SQL, badge, debug, echo, guy, help, info, isa, new_bsqlt3_connection, rpr, type_of, types, urge, validate, validate_list_of, warn, whisper;

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

  //-----------------------------------------------------------------------------------------------------------
  types.declare('constructor_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      },
      "@isa_optional.nonempty_text x.location": function(x) {
        return this.isa_optional.nonempty_text(x.location);
      },
      "@isa_optional.nonempty_text x.name": function(x) {
        return this.isa_optional.nonempty_text(x.name);
      },
      "@isa_optional.nonempty_text x.path": function(x) {
        return this.isa_optional.nonempty_text(x.path);
      },
      "@isa_optional.boolean x.temporary": function(x) {
        return this.isa_optional.boolean(x.temporary);
      }
    }
  });

  //===========================================================================================================
  this.Dbay = (function() {
    class Dbay extends H.Dbay_rnd {
      //---------------------------------------------------------------------------------------------------------
      static cast_sqlt_cfg(self) {
        var R;
        R = guy.obj.pluck_with_fallback(self.cfg, null, 'readonly', 'timeout');
        R.fileMustExist = !self.cfg.create;
        delete self.cfg.create;
        return R;
      }

      //---------------------------------------------------------------------------------------------------------
      static cast_constructor_cfg(self) {
        var cfg, clasz, filename;
        // debug '^344476^', self.cfg
        clasz = self.constructor;
        cfg = self.cfg;
        //.......................................................................................................
        if (cfg.path != null) {
          if (cfg.temporary == null) {
            cfg.temporary = false;
          }
          cfg.path = PATH.resolve(cfg.path);
        } else {
          if (cfg.temporary == null) {
            cfg.temporary = true;
          }
          filename = self._get_random_filename();
          cfg.path = PATH.resolve(PATH.join(clasz.C.autolocation, filename));
        }
        if (cfg.temporary) {
          guy.process.on_exit(function() {
            var error;
            try {
              FS.unlinkSync(cfg.path);
            } catch (error1) {
              error = error1;
              if (error.code !== 'ENOENT') {
                warn('^dbay@1^', error.message);
              }
            }
            return null;
          });
        }
        self.sqlt_cfg = guy.lft.freeze(guy.obj.omit_nullish(this.cast_sqlt_cfg(self)));
        self.cfg = guy.lft.freeze(guy.obj.omit_nullish(cfg));
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      static declare_types(self) {
        this.cast_constructor_cfg(self);
        // self.types.validate.constructor_cfg self.cfg
        // # guy.props.def self, 'dba', { enumerable: false, value: self.cfg.dba, }
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _new_bsqlt3_connection() {
        var path_or_url;
        path_or_url = this.cfg.ram ? this.cfg.url : this.cfg.path;
        return new_bsqlt3_connection(path_or_url, this.sqlt_cfg);
      }

      //---------------------------------------------------------------------------------------------------------
      constructor(cfg) {
        super();
        cfg = {...cfg};
        // @_signature     = H.get_cfg_signature cfg
        guy.cfg.configure_with_types(this, cfg, types);
        debug('^344476^', this.cfg);
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
        // delete @_signature
        // @_compile_sql()
        // @_create_sql_functions()
        // @_create_db_structure()
        return void 0;
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