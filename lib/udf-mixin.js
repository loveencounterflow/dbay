(function() {
  'use strict';
  var CND, E, FS, PATH, SQL, badge, debug, echo, guy, help, info, rpr, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'ICQL-DBA/FUNCTIONS-MIXIN';

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

  //-----------------------------------------------------------------------------------------------------------
  this.DBay_udf = (clasz = Object) => {
    return class extends clasz {
      //---------------------------------------------------------------------------------------------------------
      _$udf_initialize() {
        return this._me._udf_catalog = {};
      }

      //---------------------------------------------------------------------------------------------------------
      _register_udf(udf_type, cfg) {
        var entry/* TAINT respect varargs */, name;
        /* TAINT validate more thoroughly, especially cfg._dba_udf_type */
        /* TAINT consider to use (virtual?) table for this */
        this.types.validate.nonempty_text(udf_type);
        this.types.validate.object(cfg);
        this.types.validate.nonempty_text(cfg.name);
        ({name} = cfg);
        switch (udf_type) {
          case 'single_valued':
            entry = {
              name: name,
              arity: cfg.call.length
            };
            break;
          default:
            entry = {
              name: name,
              cfg: cfg
            };
        }
        this._udf_catalog = guy.lft.lets(this._udf_catalog, function(d) {
          return d[cfg.name] = entry;
        });
        return null;
      }

      //=========================================================================================================
      // USER-DEFINED FUNCTIONS
      //---------------------------------------------------------------------------------------------------------
      create_function(cfg) {
        var call, deterministic, directOnly, name, varargs;
        this.types.validate.dbay_create_function_cfg((cfg = {...this.constructor.C.defaults.dbay_create_function_cfg, ...cfg}));
        ({name, call, directOnly, deterministic, varargs} = cfg);
        this.sqlt1.function(name, {deterministic, varargs, directOnly}, call);
        this._register_udf('single_valued', cfg);
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      create_aggregate_function(cfg) {
        var deterministic, directOnly, name, start, step, varargs;
        this.types.validate.dbay_create_aggregate_function_cfg((cfg = {...this.constructor.C.defaults.dbay_create_aggregate_function_cfg, ...cfg}));
        ({name, start, step, directOnly, deterministic, varargs} = cfg);
        this.sqlt1.aggregate(name, {start, step, deterministic, varargs, directOnly});
        this._register_udf('aggregate', cfg);
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      create_window_function(cfg) {
        var deterministic, directOnly, inverse, name, result, start, step, varargs;
        this.types.validate.dbay_create_window_function_cfg((cfg = {...this.constructor.C.defaults.dbay_create_window_function_cfg, ...cfg}));
        ({name, start, step, inverse, result, directOnly, deterministic, varargs} = cfg);
        this.sqlt1.aggregate(name, {start, step, inverse, result, deterministic, varargs, directOnly});
        this._register_udf('window', cfg);
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      create_table_function(cfg) {
        var columns, deterministic, directOnly, name, parameters, rows, varargs;
        this.types.validate.dbay_create_table_function_cfg((cfg = {...this.constructor.C.defaults.dbay_create_table_function_cfg, ...cfg}));
        ({name, parameters, columns, rows, directOnly, deterministic, varargs} = cfg);
        this.sqlt1.table(name, {parameters, columns, rows, deterministic, varargs, directOnly});
        this._register_udf('table_function', cfg);
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      create_virtual_table(cfg) {
        var create, name;
        this.types.validate.dbay_create_virtual_table_cfg((cfg = {...this.constructor.C.defaults.dbay_create_virtual_table_cfg, ...cfg}));
        ({name, create} = cfg);
        this.sqlt1.table(name, create);
        this._register_udf('virtual_table', cfg);
        return null;
      }

    };
  };

}).call(this);

//# sourceMappingURL=udf-mixin.js.map