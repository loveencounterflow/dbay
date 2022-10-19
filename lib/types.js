(function() {
  'use strict';
  var CND, Intertype, alert, badge, debug, help, info, intertype, jr, rpr, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'DBAY/TYPES';

  debug = CND.get_logger('debug', badge);

  alert = CND.get_logger('alert', badge);

  whisper = CND.get_logger('whisper', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  info = CND.get_logger('info', badge);

  jr = JSON.stringify;

  Intertype = (require('intertype')).Intertype;

  intertype = new Intertype(module.exports);

  //-----------------------------------------------------------------------------------------------------------
  this.declare('dbay_schema', function(x) {
    if (!this.isa.text(x)) {
      /* NOTE to keep things simple, only allow lower case ASCII letters, digits, underscores in schemas */
      return false;
    }
    return /^[a-z_][a-z0-9_]*$/.test(x);
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('dbay_usr_schema', function(x) {
    return (this.isa.dbay_schema(x)) && (x !== 'main' && x !== 'temp');
  });

  this.declare('dbay_path', function(x) {
    return this.isa.text(x);
  });

  this.declare('dbay_name', function(x) {
    return this.isa.nonempty_text(x);
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('constructor_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      },
      "@isa.nonempty_text x.path": function(x) {
        return this.isa.nonempty_text(x.path);
      },
      "@isa.boolean x.temporary": function(x) {
        return this.isa.boolean(x.temporary);
      },
      // "@isa.boolean x.create_stdlib":             ( x ) -> @isa.boolean x.create_stdlib
      "x.random_seed  may be set": function(x) {
        return true;
      },
      "x.random_delta may be set": function(x) {
        return true;
      },
      "@isa.boolean x.macros": function(x) {
        return this.isa.boolean(x.macros);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('dbay_with_transaction_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      },
      "x.mode in [ 'deferred', 'immediate', 'exclusive', ]": function(x) {
        var ref;
        return (ref = x.mode) === 'deferred' || ref === 'immediate' || ref === 'exclusive';
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('dbay_open_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      },
      "@isa.dbay_usr_schema x.schema": function(x) {
        return this.isa.dbay_usr_schema(x.schema);
      },
      "@isa_optional.dbay_path x.path": function(x) {
        return this.isa_optional.dbay_path(x.path);
      },
      "@isa.boolean x.temporary": function(x) {
        return this.isa.boolean(x.temporary);
      }
    }
  });

  // "@isa.boolean x.overwrite":             ( x ) -> @isa.boolean x.overwrite
  // "@isa.boolean x.create":                ( x ) -> @isa.boolean x.create

  //===========================================================================================================
  // UDF
  //-----------------------------------------------------------------------------------------------------------
  this.declare('dbay_create_function_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      },
      "@isa.nonempty_text x.name": function(x) {
        return this.isa.nonempty_text(x.name);
      },
      "@isa.function x.call": function(x) {
        return this.isa.function(x.call);
      },
      "@isa.boolean x.deterministic": function(x) {
        return this.isa.boolean(x.deterministic);
      },
      "@isa.boolean x.varargs": function(x) {
        return this.isa.boolean(x.varargs);
      },
      "@isa.boolean x.directOnly": function(x) {
        return this.isa.boolean(x.directOnly);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('dbay_create_aggregate_function_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      },
      "@isa.nonempty_text x.name": function(x) {
        return this.isa.nonempty_text(x.name);
      },
      // "@isa.any x.start":               ( x ) -> @isa.any x.start
      "@isa.function x.step": function(x) {
        return this.isa.function(x.step);
      },
      "@isa.boolean x.deterministic": function(x) {
        return this.isa.boolean(x.deterministic);
      },
      "@isa.boolean x.varargs": function(x) {
        return this.isa.boolean(x.varargs);
      },
      "@isa.boolean x.directOnly": function(x) {
        return this.isa.boolean(x.directOnly);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('dbay_create_window_function_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      },
      "@isa.nonempty_text x.name": function(x) {
        return this.isa.nonempty_text(x.name);
      },
      // "@isa.any x.start":                 ( x ) -> @isa.any x.start
      "@isa.function x.step": function(x) {
        return this.isa.function(x.step);
      },
      "@isa.function x.inverse": function(x) {
        return this.isa.function(x.inverse);
      },
      "@isa_optional.function x.result": function(x) {
        return this.isa_optional.function(x.result);
      },
      "@isa.boolean x.deterministic": function(x) {
        return this.isa.boolean(x.deterministic);
      },
      "@isa.boolean x.varargs": function(x) {
        return this.isa.boolean(x.varargs);
      },
      "@isa.boolean x.directOnly": function(x) {
        return this.isa.boolean(x.directOnly);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('dbay_create_table_function_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      },
      "@isa.nonempty_text x.name": function(x) {
        return this.isa.nonempty_text(x.name);
      },
      "@isa_optional.list x.columns": function(x) {
        return this.isa_optional.list(x.columns);
      },
      "@isa_optional.list x.parameters": function(x) {
        return this.isa_optional.list(x.parameters);
      },
      "@isa.generatorfunction x.rows": function(x) {
        return this.isa.generatorfunction(x.rows);
      },
      "@isa.boolean x.deterministic": function(x) {
        return this.isa.boolean(x.deterministic);
      },
      "@isa.boolean x.varargs": function(x) {
        return this.isa.boolean(x.varargs);
      },
      "@isa.boolean x.directOnly": function(x) {
        return this.isa.boolean(x.directOnly);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('dbay_create_virtual_table_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      },
      "@isa.nonempty_text x.name": function(x) {
        return this.isa.nonempty_text(x.name);
      },
      "@isa.function x.create": function(x) {
        return this.isa.function(x.create);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('dbay_execute_file_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      },
      "@isa.nonempty_text x.path": function(x) {
        return this.isa.nonempty_text(x.path);
      },
      "@isa.nonempty_text x.encoding": function(x) {
        return this.isa.nonempty_text(x.encoding);
      }
    }
  });

  //===========================================================================================================
  // SQLGEN
  //-----------------------------------------------------------------------------------------------------------
  this.declare('dbay_create_insert_on_conflict_cfg', function(x) {});

  //-----------------------------------------------------------------------------------------------------------
  this.declare('dbay_create_insert_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      },
      "@isa.dbay_schema x.schema": function(x) {
        return this.isa.dbay_schema(x.schema);
      },
      "@isa.dbay_name x.into": function(x) {
        return this.isa.dbay_name(x.into);
      },
      "@isa_optional.nonempty_text x.returning": function(x) {
        return this.isa_optional.nonempty_text(x.returning);
      },
      "x.on_conflict is an optional nonempty_text or suitable object": function(x) {
        if (x.on_conflict == null) {
          return true;
        }
        if (this.isa.nonempty_text(x.on_conflict)) {
          return true;
        }
        if (!this.isa.object(x.on_conflict)) {
          return false;
        }
        if (x.on_conflict.update !== true) {
          return false;
        }
        return true;
      },
      "either x.fields or x.exclude may be a nonempty list of nonempty_texts": function(x) {
        if (x.fields != null) {
          if (x.exclude != null) {
            return false;
          }
          if (!this.isa.list(x.fields)) {
            return false;
          }
          if (!(x.fields.length > 0)) {
            return false;
          }
          if (!x.fields.every((e) => {
            return this.isa.nonempty_text(e);
          })) {
            return false;
          }
          return true;
        }
        if (x.exclude != null) {
          if (!this.isa.list(x.exclude)) {
            return false;
          }
          if (!(x.exclude.length > 0)) {
            return false;
          }
          if (!x.exclude.every((e) => {
            return this.isa.nonempty_text(e);
          })) {
            return false;
          }
          return true;
        }
        return true;
      }
    }
  });

  //===========================================================================================================
  // DT
  //-----------------------------------------------------------------------------------------------------------
  this.declare('dbay_dt_valid_dayjs', {
    tests: {
      "( @type_of x ) is 'm'": function(x) {
        return (this.type_of(x)) === 'm';
      },
      "@isa.float x.$y": function(x) {
        return this.isa.float(x.$y);
      },
      "@isa.float x.$M": function(x) {
        return this.isa.float(x.$M);
      },
      "@isa.float x.$D": function(x) {
        return this.isa.float(x.$D);
      },
      "@isa.float x.$W": function(x) {
        return this.isa.float(x.$W);
      },
      "@isa.float x.$H": function(x) {
        return this.isa.float(x.$H);
      },
      "@isa.float x.$m": function(x) {
        return this.isa.float(x.$m);
      },
      "@isa.float x.$s": function(x) {
        return this.isa.float(x.$s);
      },
      "@isa.float x.$ms": function(x) {
        return this.isa.float(x.$ms);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('dbay_dt_timestamp', {
    tests: {
      "@isa.text x": function(x) {
        return this.isa.text(x);
      },
      "( /^\\d{8}-\\d{6}Z$/ ).test x": function(x) {
        return /^\d{8}-\d{6}Z$/.test(x);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('dba_dt_now_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      }
    }
  });

}).call(this);

//# sourceMappingURL=types.js.map