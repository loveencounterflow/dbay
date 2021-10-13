(function() {
  'use strict';
  var CND, Dba, Intertype, alert, badge, debug, help, info, intertype, jr, rpr, urge, warn, whisper;

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

  Dba = null;

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

  //===========================================================================================================
  // SQLGEN
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
      "@isa_optional.nonempty_text x.on_conflict": function(x) {
        return this.isa_optional.nonempty_text(x.on_conflict);
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

}).call(this);

//# sourceMappingURL=types.js.map