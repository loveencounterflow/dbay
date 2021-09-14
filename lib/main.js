(function() {
  'use strict';
  var CND, E, PATH, SQL, badge, debug, echo, guy, help, info, isa, rpr, type_of, types, urge, validate, validate_list_of, warn, whisper;

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

  types = new (require('intertype')).Intertype();

  ({isa, type_of, validate, validate_list_of} = types.export());

  SQL = String.raw;

  guy = require('guy');

  E = require('./errors');

  //-----------------------------------------------------------------------------------------------------------
  types.declare('dba_urlsafe_word', {
    tests: {
      "@isa.nonempty_text x": function(x) {
        return this.isa.nonempty_text(x);
      },
      "/^[a-zA-Z0-9_]+$/.test x": function(x) {
        return /^[a-zA-Z0-9_]+$/.test(x);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  types.declare('constructor_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      },
      "@isa_optional.boolean x.ram": function(x) {
        return this.isa_optional.boolean(x.ram);
      },
      "@isa_optional.nonempty_text x.url": function(x) {
        return this.isa_optional.nonempty_text(x.url);
      },
      "@isa_optional.nonempty_text x.path": function(x) {
        return this.isa_optional.nonempty_text(x.path);
      },
      "@isa_optional.dba_urlsafe_word x.dbnick": function(x) {
        return this.isa_optional.dba_urlsafe_word(x.dbnick);
      }
    }
  });

  this.Dbay = (function() {
    class Dbay {
      //---------------------------------------------------------------------------------------------------------
      static cast_constructor_cfg(self) {
        var base, base1, dbnick, k, ref, ref1, url, v;
        // debug '^344476^', self
        // debug '^344476^', self.cfg
        if ((self.cfg.ram === false) && (self.cfg.path == null)) {
          throw new E.Dbay_cfg_error('^dba@1^', `missing argument \`path\`, got ${rpr(self.cfg)}`);
        }
        if ((base = self.cfg).ram == null) {
          base.ram = self.cfg.path == null;
        }
        if ((!self.cfg.ram) && (self.cfg.path != null) && (self.cfg.dbnick != null)) {
          throw new E.Dbay_cfg_error('^dba@1^', `only RAM DB can have both \`path\` and \`dbnick\`, got ${rpr(self.cfg)}`);
        }
        if (self.cfg.ram) {
          ({dbnick, url} = self._get_connection_url((ref = self.cfg.dbnick) != null ? ref : null));
          if ((base1 = self.cfg).dbnick == null) {
            base1.dbnick = dbnick;
          }
          self.cfg.url = url;
        } else {
          self.cfg.url = null;
        }
        ref1 = self.cfg;
        for (k in ref1) {
          v = ref1[k];
          if (v == null) {
            self.cfg[k] = null;
          }
        }
        return self.cfg;
      }

      //---------------------------------------------------------------------------------------------------------
      static declare_types(self) {
        // debug '^133^', self.cfg, Object.isFrozen self.cfg
        self.cfg = this.cast_constructor_cfg(self);
        self.types.validate.constructor_cfg(self.cfg);
        // guy.props.def self, 'dba', { enumerable: false, value: self.cfg.dba, }
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      constructor(cfg) {
        //---------------------------------------------------------------------------------------------------------
        this._get_connection_url = this._get_connection_url.bind(this);
        // super()
        this._initialize_prng();
        guy.cfg.configure_with_types(this, cfg, types);
        // @_compile_sql()
        // @_create_sql_functions()
        // @_create_db_structure()
        return void 0;
      }

      _initialize_prng() {
        var clasz, delta, ref, ref1, seed;
        clasz = this.constructor;
        if (clasz._rnd_int_cfg != null) {
          seed = (ref = clasz._rnd_int_cfg.seed) != null ? ref : 12.34;
          delta = (ref1 = clasz._rnd_int_cfg.delta) != null ? ref1 : 1;
          this._rnd_int = CND.get_rnd_int(seed, delta);
        } else {
          this._rnd_int = CND.random_integer.bind(CND);
        }
        return null;
      }

      _get_connection_url(dbnick = null) {
        var url;
        /* TAINT rename `dbnick` to `dbnick` */
        /* Given an optional `dbnick`, return an object with the `dbnick` and the `url` for a new SQLite
           connection. The url will look like `'file:your_name_here?mode=memory&cache=shared` so multiple
           connections to the same RAM DB can be opened. When `dbnick` is not given, a random dbnick like
           `_icql_6200294332` will be chosen (prefix `_icql_`, suffix ten decimal digits). For testing, setting
           class property `@_rnd_int_cfg` can be used to obtain repeatable series of random names. */
        if (dbnick == null) {
          dbnick = `_icql_${this._rnd_int(1_000_000_000, 9_999_999_999)}`;
        }
        url = `file:${dbnick}?mode=memory&cache=shared`;
        return {url, dbnick};
      }

    };

    //---------------------------------------------------------------------------------------------------------
    Dbay.C = guy.lft.freeze({
      defaults: {
        constructor_cfg: {
          _temp_prefix: '_dba_temp_',
          readonly: false,
          create: true,
          overwrite: false,
          timeout: 5000,
          //...................................................................................................
          ram: null,
          path: null,
          dbnick: null
        }
      }
    });

    //=========================================================================================================
    // RANDOM NUMBER GENERATION
    // seedable for testing purposes
    //---------------------------------------------------------------------------------------------------------
    /* To obtain a class with a seedable PRNG that emits repeatable sequences, define class property
     `@_rnd_int_cfg: { seed, delta, }` where both seed and delta can be arbitrary finite numbers. **NOTE**
     very small `delta` values (like 1e-10) may cause adjacent numbers to be close together or even repeat. To
     use default values for both parameters, set `@_rnd_int_cfg: true`.*/
    Dbay._rnd_int_cfg = null;

    return Dbay;

  }).call(this);

}).call(this);

//# sourceMappingURL=main.js.map