(function() {
  'use strict';
  var CND, PATH, SQL, badge, debug, echo, guy, help, info, isa, rpr, type_of, types, urge, validate, validate_list_of, warn, whisper;

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

  guy = require('../../../apps/guy');

  // E                         = require './errors'
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
      "@isa_optional.dba_urlsafe_word x.dbnick": function(x) {
        return this.isa_optional.dba_urlsafe_word(x.dbnick);
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
        var base, base1, dbnick, ref, url;
        if ((self.cfg.ram === false) && (self.cfg.path == null)) {
          throw new E.Dba_cfg_error('^dba@1^', `missing argument \`path\`, got ${rpr(self.cfg)}`);
        }
        if ((base = self.cfg).ram == null) {
          base.ram = self.cfg.path == null;
        }
        if ((!self.cfg.ram) && (self.cfg.path != null) && (self.cfg.dbnick != null)) {
          throw new E.Dba_cfg_error('^dba@1^', `only RAM DB can have both \`path\` and \`dbnick\`, got ${rpr(self.cfg)}`);
        }
        if (self.cfg.ram) {
          ({dbnick, url} = _xxx_dba._get_connection_url((ref = self.cfg.dbnick) != null ? ref : null));
          if ((base1 = self.cfg).dbnick == null) {
            base1.dbnick = dbnick;
          }
          self.cfg.url = url;
        } else {
          self.cfg.url = null;
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
        // super()
        guy.cfg.configure_with_types(this, cfg, types);
        // @_compile_sql()
        // @_create_sql_functions()
        // @_create_db_structure()
        return void 0;
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
          ram: false,
          path: null,
          dbnick: null
        }
      }
    });

    return Dbay;

  }).call(this);

}).call(this);

//# sourceMappingURL=main.js.map