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

  //###########################################################################################################
//###########################################################################################################
//###########################################################################################################
//###########################################################################################################
//###########################################################################################################
//###########################################################################################################
//###########################################################################################################
//###########################################################################################################
//###########################################################################################################

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'ic_entry_type',
//   tests:
//     "x is a text":                              ( x ) -> @isa.text    x
//     "x is in 'procedure', 'query', 'fragment'": ( x ) -> x in [ 'procedure', 'query', 'fragment', ]

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_ram_path',        ( x ) -> x in [ null, '', ':memory:', ]

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_import_cfg', tests:
//   "@isa.object x":                                ( x ) -> @isa.object x
//   "@isa.dbay_usr_schema x.schema":             ( x ) -> @isa.dbay_usr_schema x.schema
//   "@isa.dbay_path x.path":                          ( x ) -> @isa.dbay_path x.path
//   "@isa_optional.dba_format x.format":            ( x ) -> @isa_optional.dba_format x.format
//   "x.method in [ 'single', 'batch', ]":           ( x ) -> x.method in [ 'single', 'batch', ]
//   "@isa_optional.positive_integer x.batch_size":  ( x ) -> @isa_optional.positive_integer x.batch_size
//   # "x.overwrite is a boolean":             ( x ) -> @isa.boolean x.overwrite

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_import_cfg_csv', tests:
//   "@isa.dba_import_cfg x":                        ( x ) -> @isa.dba_import_cfg x
//   "@isa.dbay_name x.table_name":                    ( x ) -> @isa.dbay_name x.table_name
//   ### NOTE see `_import_csv()`; for now only RAM DBs allowed for imported CSV ###
//   "@isa.true x.ram":                              ( x ) -> @isa.true x.ram
//   # "@isa.boolean x.skip_first":                    ( x ) -> @isa.boolean x.skip_first
//   # "@isa.boolean x.skip_empty":                    ( x ) -> @isa.boolean x.skip_empty
//   # "@isa.boolean x.skip_blank":                    ( x ) -> @isa.boolean x.skip_blank
//   "@isa.boolean x.skip_any_null":                 ( x ) -> @isa.boolean x.skip_any_null
//   "@isa.boolean x.skip_all_null":                 ( x ) -> @isa.boolean x.skip_all_null
//   "@isa.boolean x.trim":                          ( x ) -> @isa.boolean x.trim
//   "@isa.any x.default_value":                     ( x ) -> true
//   "@isa_optional.object x._extra":                ( x ) -> @isa_optional.object x._extra
//   "x.table is deprecated":                        ( x ) -> x.table is undefined
//   "x.columns is deprecated":                      ( x ) -> x.columns is undefined
//   "x.transform is a function (sync or async)":    ( x ) ->
//     return true if ( not x.transform? )
//     return true if @isa.asyncfunction x.transform
//     return true if @isa.function x.transform
//     return false
//   "x.skip_comments is a boolean or a nonempty_text": ( x ) ->
//     ( @isa.boolean x.skip_comments ) or ( @isa.nonempty_text x.skip_comments )
//   "optional input_columns isa nonempty list of nonempty text": ( x ) ->
//     { input_columns: d, } = x
//     return true if not d?
//     return true if d is true
//     return false unless @isa.list d
//     return false unless d.length > 0
//     return false unless @isa_list_of.nonempty_text d
//     return true
//   "optional table_columns isa nonempty list of nonempty text": ( x ) ->
//     { table_columns: d, } = x
//     return true if not d?
//     switch @type_of d
//       when 'list'
//         return false unless d.length > 0
//         return false unless @isa_list_of.nonempty_text d
//       when 'object'
//         k = ( k for k, v of d )
//         return false unless k.length > 0
//         return false unless @isa_list_of.nonempty_text k
//         v = ( v for k, v of d )
//         return false unless v.length > 0
//         return false unless @isa_list_of.nonempty_text v
//       else
//         return false
//     return true

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_import_cfg_csv_extra', tests:
//   ### see https://csv.js.org/parse/options/ ###
//   ### relying on `csv-parse` to do the right thing ###
//   "@isa_optional.object x":                       ( x ) -> @isa_optional.object x

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_save_cfg', tests:
//   "@isa.object x":                               ( x ) -> @isa.object x
//   "@isa.dbay_usr_schema x.schema":            ( x ) -> @isa.dbay_usr_schema x.schema
//   "@isa_optional.dbay_path x.path":                ( x ) -> @isa_optional.dbay_path x.path
//   "@isa_optional.dba_format x.format":           ( x ) -> @isa_optional.dba_format x.format

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_vacuum_atomically', tests:
//   "@isa.object x":                               ( x ) -> @isa.object x
//   "@isa.dbay_usr_schema x.schema":            ( x ) -> @isa.dbay_usr_schema x.schema
//   "@isa_optional.dbay_path x.path":                ( x ) -> @isa_optional.dbay_path x.path

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_export_cfg', tests:
//   "@isa.object x":                               ( x ) -> @isa.object x
//   "@isa.dbay_usr_schema x.schema":            ( x ) -> @isa.dbay_usr_schema x.schema
//   "@isa.dbay_path x.path":                         ( x ) -> @isa.dbay_path x.path
//   "@isa_optional.dba_format x.format":           ( x ) -> @isa_optional.dba_format x.format

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_attach_cfg', tests:
//   "@isa.object x":                                  ( x ) -> @isa.object x
//   "@isa.dbay_usr_schema x.schema":               ( x ) -> @isa.dbay_usr_schema x.schema
//   "@isa.dbay_path x.path":                            ( x ) -> @isa.dbay_path x.path
//   "( x.saveas is null ) or @isa.dbay_path x.saveas":  ( x ) -> ( x.saveas is null ) or @isa.dbay_path x.saveas

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'copy_or_move_schema_cfg', tests:
//   "@isa.object x":                          ( x ) -> @isa.object x
//   "@isa.dbay_usr_schema x.from_schema":  ( x ) -> @isa.dbay_usr_schema x.from_schema
//   "@isa.dbay_usr_schema x.to_schema":    ( x ) -> @isa.dbay_usr_schema x.to_schema

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_is_ram_db_cfg', tests:
//   "@isa.object x":                          ( x ) -> @isa.object x
//   "@isa.dbay_schema x.schema":                ( x ) -> @isa.dbay_schema x.schema

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_detach_cfg', tests:
//   "@isa.object x":                          ( x ) -> @isa.object x
//   "@isa.dbay_schema x.schema":                ( x ) -> @isa.dbay_schema x.schema

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_has_cfg', tests:
//   "@isa.object x":                          ( x ) -> @isa.object x
//   "@isa.dbay_schema x.schema":                ( x ) -> @isa.dbay_schema x.schema

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_is_empty_cfg', tests:
//   "@isa.object x":                          ( x ) -> @isa.object x
//   "@isa.dbay_schema x.schema":                ( x ) -> @isa.dbay_schema x.schema
//   "@isa.nonempty_text x.name":              ( x ) -> @isa_optional.dbay_name x.name

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_clear_cfg', tests:
//   "@isa.object x":                          ( x ) -> @isa.object x
//   "@isa.dbay_schema x.schema":                ( x ) -> @isa.dbay_schema x.schema

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_walk_objects_cfg', tests:
//   "@isa.object x":                          ( x ) -> @isa.object x
//   "@isa.dbay_schema x.schema":                ( x ) -> @isa.dbay_schema x.schema
//   "x._ordering is optionally 'drop'":       ( x ) -> ( not x._ordering? ) or ( x._ordering is 'drop' )

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_type_of_cfg', tests:
//   "@isa.object x":                          ( x ) -> @isa.object x
//   "@isa.dbay_schema x.schema":                ( x ) -> @isa.dbay_schema x.schema
//   "@isa.nonempty_text x.name":              ( x ) -> @isa_optional.dbay_name x.name

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_fields_of_cfg', tests:
//   "@isa.object x":                          ( x ) -> @isa.object x
//   "@isa.dbay_schema x.schema":                ( x ) -> @isa.dbay_schema x.schema
//   "@isa.nonempty_text x.name":              ( x ) -> @isa_optional.dbay_name x.name

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_field_names_of_cfg', tests:
//   "@isa.object x":                          ( x ) -> @isa.object x
//   "@isa.dbay_schema x.schema":                ( x ) -> @isa.dbay_schema x.schema
//   "@isa.nonempty_text x.name":              ( x ) -> @isa_optional.dbay_name x.name

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'sql_limit', ( x ) ->
//   return true unless x?
//   return true if @isa.nonempty_text x
//   return true if @isa.cardinal x
//   return false

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_dump_relation_cfg', tests:
//   "@isa.object x":                          ( x ) -> @isa.object x
//   "@isa.dbay_schema x.schema":                ( x ) -> @isa.dbay_schema x.schema
//   "@isa.nonempty_text x.name":              ( x ) -> @isa_optional.dbay_name x.name
//   "@isa.nonempty_text x.order_by":          ( x ) -> @isa.nonempty_text x.order_by
//   "@isa.sql_limit x.limit":                 ( x ) -> @isa.sql_limit x.limit

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba', tests:
//   "x instanceof Dba":                     ( x ) -> x instanceof ( Dba ?= ( require './main' ).Dba )

  // #-----------------------------------------------------------------------------------------------------------
// @declare 'dba_create_stdlib_cfg', tests:
//   "@isa.object x":                        ( x ) -> @isa.object x
//   "@isa.dbay_schema x.prefix":              ( x ) -> @isa.dbay_schema x.prefix

  // #-----------------------------------------------------------------------------------------------------------
// @defaults =
//   #.........................................................................................................
//   dba_constructor_cfg:
//     _temp_prefix: '_dba_temp_'
//     readonly:     false
//     create:       true
//     overwrite:    false
//     timeout:      5000
//     # schema:       'main'
//     path:         null
//     ram:          false
//   #.........................................................................................................
//   dba_attach_cfg:
//     schema:     null
//     path:       ''
//     saveas:     null
//   #.........................................................................................................
//   dba_detach_cfg:
//     schema:     null
//   #.........................................................................................................
//   dba_has_cfg:
//     schema:     null
//   #.........................................................................................................
//   dba_open_cfg:
//     schema:     'main'
//     path:       null
//     ram:        false
//     # overwrite:  false
//     # create:     true
//   #.........................................................................................................
//   dba_export_cfg:
//     schema:     null
//     path:       null
//     format:     null
//   #.........................................................................................................
//   dba_save_cfg:
//     schema:     null
//     path:       null
//     format:     null
//   #.........................................................................................................
//   dba_vacuum_atomically:
//     schema:     null
//     path:       null
//   #.........................................................................................................
//   dba_import_cfg:
//     schema:     null
//     path:       null
//     format:     null
//     method:     'single'
//     batch_size: 1000
//   #.........................................................................................................
//   dba_import_cfg_csv:
//     table_name:       'main'
//     transform:        null
//     _extra:           null
//     skip_any_null:    false
//     skip_all_null:    false
//     skip_comments:    false
//     trim:             true
//     default_value:    null
//     # skip_first:       false
//     # skip_empty:       true
//     # skip_blank:       true
//   #.........................................................................................................
//   dba_import_cfg_csv_extra:
//     ### see https://github.com/mafintosh/csv-parser#options ###
//     headers:          false       # Array[String] | Boolean
//     escape:           '"'         # String, default: "
//     # mapHeaders:       null        # Function
//     # mapValues:        null        # Function (not used as it calls for each cell instead of for each row)
//     newline:          '\n'        # String, default: '\n'
//     quote:            '"'         # String, default: '"'
//     raw:              false       # Boolean, default: false
//     separator:        ','         # String, Default: ','
//     skipComments:     false       # Boolean | String, default: false
//     skipLines:        0           # Number, default: 0
//     maxRowBytes:      Infinity    # Number, Default: Number.MAX_SAFE_INTEGER
//     strict:           false       # Boolean, default: false
//   #.........................................................................................................
//   dba_import_cfg_tsv_extra:
//     ### see https://github.com/mafintosh/csv-parser#options ###
//     headers:          false       # Array[String] | Boolean
//     escape:           ''          # String, default: "
//     # mapHeaders:       null        # Function
//     # mapValues:        null        # Function (not used as it calls for each cell instead of for each row)
//     newline:          '\n'        # String, default: '\n'
//     quote:            ''          # String, default: '"'
//     raw:              false       # Boolean, default: false
//     separator:        '\t'         # String, Default: ','
//     skipComments:     false       # Boolean | String, default: false
//     skipLines:        0           # Number, default: 0
//     maxRowBytes:      Infinity    # Number, Default: Number.MAX_SAFE_INTEGER
//     strict:           false       # Boolean, default: false
//   #.........................................................................................................
//   copy_or_move_schema_cfg:
//     from_schema:  null
//     to_schema:    null
//   #.........................................................................................................
//   dba_is_ram_db_cfg:
//     schema:       null
//   #.........................................................................................................
//   dba_clear_cfg:
//     schema:       null
//   #.........................................................................................................
//   dba_walk_objects_cfg:
//     schema:       null
//     _ordering:    null
//   #.........................................................................................................
//   extensions_and_formats:
//     db:           'sqlite'
//     sqlite:       'sqlite'
//     sqlitedb:     'sqlite'
//     sql:          'sql'
//     txt:          'tsv'
//     tsv:          'tsv'
//     csv:          'csv'
//   #.........................................................................................................
//   dba_type_of_cfg:
//     schema:       null
//     name:         null
//   #.........................................................................................................
//   dba_fields_of_cfg:
//     schema:       null
//     name:         null
//   #.........................................................................................................
//   dba_field_names_of_cfg:
//     schema:       null
//     name:         null
//   #.........................................................................................................
//   dba_dump_relation_cfg:
//     schema:       null
//     name:         null
//     order_by:     'random()'
//     limit:        10
//   #.........................................................................................................
//   dba_create_stdlib_cfg:
//     prefix:       'std_'

  // #-----------------------------------------------------------------------------------------------------------
// @_import_formats = _import_formats = new Set Object.keys @defaults.extensions_and_formats
// @declare 'dba_format', ( x ) -> _import_formats.has x

}).call(this);

//# sourceMappingURL=types.js.map