(function() {
  'use strict';
  var CND, badge, rpr;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'DBAY/ERRORS';

  // debug                     = CND.get_logger 'debug',     badge
  // warn                      = CND.get_logger 'warn',      badge
  // info                      = CND.get_logger 'info',      badge
  // urge                      = CND.get_logger 'urge',      badge
  // help                      = CND.get_logger 'help',      badge
  // whisper                   = CND.get_logger 'whisper',   badge
  // echo                      = CND.echo.bind CND

  //-----------------------------------------------------------------------------------------------------------
  this.DBay_error = class DBay_error extends Error {
    constructor(ref, message) {
      super();
      this.message = `${ref} (${this.constructor.name}) ${message}`;
      this.ref = ref;
      return void 0/* always return `undefined` from constructor */;
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  this.DBay_cfg_error = class DBay_cfg_error extends this.DBay_error {
    constructor(ref, message) {
      super(ref, message);
    }

  };

  this.DBay_internal_error = class DBay_internal_error extends this.DBay_error {
    constructor(ref, message) {
      super(ref, message);
    }

  };

  this.DBay_schema_exists = class DBay_schema_exists extends this.DBay_error {
    constructor(ref, schema) {
      super(ref, `schema ${rpr(schema)} already exists`);
    }

  };

  this.DBay_schema_unknown = class DBay_schema_unknown extends this.DBay_error {
    constructor(ref, schema) {
      super(ref, `schema ${rpr(schema)} does not exist`);
    }

  };

  this.DBay_object_unknown = class DBay_object_unknown extends this.DBay_error {
    constructor(ref, schema, name) {
      super(ref, `object ${rpr(schema + '.' + name)} does not exist`);
    }

  };

  this.DBay_schema_nonempty = class DBay_schema_nonempty extends this.DBay_error {
    constructor(ref, schema) {
      super(ref, `schema ${rpr(schema)} isn't empty`);
    }

  };

  this.DBay_schema_not_allowed = class DBay_schema_not_allowed extends this.DBay_error {
    constructor(ref, schema) {
      super(ref, `schema ${rpr(schema)} not allowed here`);
    }

  };

  this.DBay_schema_repeated = class DBay_schema_repeated extends this.DBay_error {
    constructor(ref, schema) {
      super(ref, `unable to copy schema to itself, got ${rpr(schema)}`);
    }

  };

  this.DBay_expected_single_row = class DBay_expected_single_row extends this.DBay_error {
    constructor(ref, row_count) {
      super(ref, `expected 1 row, got ${row_count}`);
    }

  };

  this.DBay_expected_single_value = class DBay_expected_single_value extends this.DBay_error {
    constructor(ref, keys) {
      super(ref, `expected row with single field, got fields ${rpr(keys)}`);
    }

  };

  this.DBay_extension_unknown = class DBay_extension_unknown extends this.DBay_error {
    constructor(ref, path) {
      super(ref, `extension of path ${path} is not registered for any format`);
    }

  };

  this.DBay_not_implemented = class DBay_not_implemented extends this.DBay_error {
    constructor(ref, what) {
      super(ref, `${what} isn't implemented (yet)`);
    }

  };

  this.DBay_deprecated = class DBay_deprecated extends this.DBay_error {
    constructor(ref, what) {
      super(ref, `${what} has been deprecated`);
    }

  };

  this.DBay_unexpected_db_object_type = class DBay_unexpected_db_object_type extends this.DBay_error {
    constructor(ref, type, value) {
      super(ref, `µ769 unknown type ${rpr(type)} of DB object ${d}`);
    }

  };

  this.DBay_sql_value_error = class DBay_sql_value_error extends this.DBay_error {
    constructor(ref, type, value) {
      super(ref, `unable to express a ${type} as SQL literal, got ${rpr(value)}`);
    }

  };

  this.DBay_sql_not_a_list_error = class DBay_sql_not_a_list_error extends this.DBay_error {
    constructor(ref, type, value) {
      super(ref, `expected a list, got a ${type}`);
    }

  };

  this.DBay_unexpected_sql = class DBay_unexpected_sql extends this.DBay_error {
    constructor(ref, sql) {
      super(ref, `unexpected SQL string ${rpr(sql)}`);
    }

  };

  this.DBay_sqlite_too_many_dbs = class DBay_sqlite_too_many_dbs extends this.DBay_error {
    constructor(ref, schema) {
      super(ref, `unable to attach schema ${rpr(schema)}: too many attached databases`);
    }

  };

  this.DBay_sqlite_error = class DBay_sqlite_error extends this.DBay_error {
    constructor(ref, error) {
      var ref1;
      super(ref, `${(ref1 = error.code) != null ? ref1 : 'SQLite error'}: ${error.message}`);
    }

  };

  this.DBay_no_arguments_allowed = class DBay_no_arguments_allowed extends this.DBay_error {
    constructor(ref, name, arity) {
      super(ref, `method ${name} doesn't take arguments, got ${arity}`);
    }

  };

  this.DBay_argument_not_allowed = class DBay_argument_not_allowed extends this.DBay_error {
    constructor(ref, name, value) {
      super(ref, `argument ${name} not allowed, got ${rpr(value)}`);
    }

  };

  this.DBay_argument_missing = class DBay_argument_missing extends this.DBay_error {
    constructor(ref, name) {
      super(ref, `expected value for ${name}, got nothing`);
    }

  };

  this.DBay_wrong_type = class DBay_wrong_type extends this.DBay_error {
    constructor(ref, types, type) {
      super(ref, `expected ${types}, got a ${type}`);
    }

  };

  this.DBay_wrong_arity = class DBay_wrong_arity extends this.DBay_error {
    constructor(ref, name, min, max, found) {
      super(ref, `${name} expected between ${min} and ${max} arguments, got ${found}`);
    }

  };

  this.DBay_empty_csv = class DBay_empty_csv extends this.DBay_error {
    constructor(ref, path) {
      super(ref, `no CSV records found in file ${path}`);
    }

  };

  this.DBay_interpolation_format_unknown = class DBay_interpolation_format_unknown extends this.DBay_error {
    constructor(ref, format) {
      super(ref, `unknown interpolation format ${rpr(format)}`);
    }

  };

  this.DBay_no_nested_transactions = class DBay_no_nested_transactions extends this.DBay_error {
    constructor(ref) {
      super(ref, "cannot start a transaction within a transaction");
    }

  };

  this.DBay_no_deferred_fks_in_tx = class DBay_no_deferred_fks_in_tx extends this.DBay_error {
    constructor(ref) {
      super(ref, "cannot defer foreign keys inside a transaction");
    }

  };

  this.DBay_unknown_variable = class DBay_unknown_variable extends this.DBay_error {
    constructor(ref, name) {
      super(ref, `unknown variable ${rpr(name)}`);
    }

  };

  this.DBay_invalid_timestamp = class DBay_invalid_timestamp extends this.DBay_error {
    constructor(ref, x) {
      super(ref, `not a valid DBay timestamp: ${rpr(x)}`);
    }

  };

  /* TAINT replace with more specific error, like below */
  this.DBay_format_unknown = class DBay_format_unknown extends this.DBay_error {
    constructor(ref, format) {
      super(ref, `unknown DB format ${ref(format)}`);
    }

  };

  this.DBay_import_format_unknown = class DBay_import_format_unknown extends this.DBay_error {
    constructor(ref, format) {
      var formats;
      formats = [...(require('./types'))._import_formats].join(', ');
      super(ref, `unknown import format ${rpr(format)} (known formats are ${formats})`);
    }

  };

}).call(this);

//# sourceMappingURL=errors.js.map