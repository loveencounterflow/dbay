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
  this.Dbay_error = class Dbay_error extends Error {
    constructor(ref, message) {
      super();
      this.message = `${ref} (${this.constructor.name}) ${message}`;
      this.ref = ref;
      return void 0/* always return `undefined` from constructor */;
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  this.Dbay_cfg_error = class Dbay_cfg_error extends this.Dbay_error {
    constructor(ref, message) {
      super(ref, message);
    }

  };

  this.Dbay_internal_error = class Dbay_internal_error extends this.Dbay_error {
    constructor(ref, message) {
      super(ref, message);
    }

  };

  this.Dbay_schema_exists = class Dbay_schema_exists extends this.Dbay_error {
    constructor(ref, schema) {
      super(ref, `schema ${rpr(schema)} already exists`);
    }

  };

  this.Dbay_schema_unknown = class Dbay_schema_unknown extends this.Dbay_error {
    constructor(ref, schema) {
      super(ref, `schema ${rpr(schema)} does not exist`);
    }

  };

  this.Dbay_object_unknown = class Dbay_object_unknown extends this.Dbay_error {
    constructor(ref, schema, name) {
      super(ref, `object ${rpr(schema + '.' + name)} does not exist`);
    }

  };

  this.Dbay_schema_nonempty = class Dbay_schema_nonempty extends this.Dbay_error {
    constructor(ref, schema) {
      super(ref, `schema ${rpr(schema)} isn't empty`);
    }

  };

  this.Dbay_schema_not_allowed = class Dbay_schema_not_allowed extends this.Dbay_error {
    constructor(ref, schema) {
      super(ref, `schema ${rpr(schema)} not allowed here`);
    }

  };

  this.Dbay_schema_repeated = class Dbay_schema_repeated extends this.Dbay_error {
    constructor(ref, schema) {
      super(ref, `unable to copy schema to itself, got ${rpr(schema)}`);
    }

  };

  this.Dbay_expected_one_row = class Dbay_expected_one_row extends this.Dbay_error {
    constructor(ref, row_count) {
      super(ref, `expected 1 row, got ${row_count}`);
    }

  };

  this.Dbay_extension_unknown = class Dbay_extension_unknown extends this.Dbay_error {
    constructor(ref, path) {
      super(ref, `extension of path ${path} is not registered for any format`);
    }

  };

  this.Dbay_not_implemented = class Dbay_not_implemented extends this.Dbay_error {
    constructor(ref, what) {
      super(ref, `${what} isn't implemented (yet)`);
    }

  };

  this.Dbay_deprecated = class Dbay_deprecated extends this.Dbay_error {
    constructor(ref, what) {
      super(ref, `${what} has been deprecated`);
    }

  };

  this.Dbay_unexpected_db_object_type = class Dbay_unexpected_db_object_type extends this.Dbay_error {
    constructor(ref, type, value) {
      super(ref, `µ769 unknown type ${rpr(type)} of DB object ${d}`);
    }

  };

  this.Dbay_sql_value_error = class Dbay_sql_value_error extends this.Dbay_error {
    constructor(ref, type, value) {
      super(ref, `unable to express a ${type} as SQL literal, got ${rpr(value)}`);
    }

  };

  this.Dbay_sql_not_a_list_error = class Dbay_sql_not_a_list_error extends this.Dbay_error {
    constructor(ref, type, value) {
      super(ref, `expected a list, got a ${type}`);
    }

  };

  this.Dbay_unexpected_sql = class Dbay_unexpected_sql extends this.Dbay_error {
    constructor(ref, sql) {
      super(ref, `unexpected SQL string ${rpr(sql)}`);
    }

  };

  this.Dbay_sqlite_too_many_dbs = class Dbay_sqlite_too_many_dbs extends this.Dbay_error {
    constructor(ref, schema) {
      super(ref, `unable to attach schema ${rpr(schema)}: too many attached databases`);
    }

  };

  this.Dbay_sqlite_error = class Dbay_sqlite_error extends this.Dbay_error {
    constructor(ref, error) {
      var ref1;
      super(ref, `${(ref1 = error.code) != null ? ref1 : 'SQLite error'}: ${error.message}`);
    }

  };

  this.Dbay_no_arguments_allowed = class Dbay_no_arguments_allowed extends this.Dbay_error {
    constructor(ref, name, arity) {
      super(ref, `method ${name} doesn't take arguments, got ${arity}`);
    }

  };

  this.Dbay_argument_not_allowed = class Dbay_argument_not_allowed extends this.Dbay_error {
    constructor(ref, name, value) {
      super(ref, `argument ${name} not allowed, got ${rpr(value)}`);
    }

  };

  this.Dbay_wrong_type = class Dbay_wrong_type extends this.Dbay_error {
    constructor(ref, types, type) {
      super(ref, `expected ${types}, got a ${type}`);
    }

  };

  this.Dbay_wrong_arity = class Dbay_wrong_arity extends this.Dbay_error {
    constructor(ref, name, min, max, found) {
      super(ref, `${name} expected between ${min} and ${max} arguments, got ${found}`);
    }

  };

  this.Dbay_empty_csv = class Dbay_empty_csv extends this.Dbay_error {
    constructor(ref, path) {
      super(ref, `no CSV records found in file ${path}`);
    }

  };

  this.Dbay_interpolation_format_unknown = class Dbay_interpolation_format_unknown extends this.Dbay_error {
    constructor(ref, format) {
      super(ref, `unknown interpolation format ${rpr(format)}`);
    }

  };

  this.Dbay_no_nested_transactions = class Dbay_no_nested_transactions extends this.Dbay_error {
    constructor(ref) {
      super(ref, "cannot start a transaction within a transaction");
    }

  };

  this.Dbay_no_deferred_fks_in_tx = class Dbay_no_deferred_fks_in_tx extends this.Dbay_error {
    constructor(ref) {
      super(ref, "cannot defer foreign keys inside a transaction");
    }

  };

  /* TAINT replace with more specific error, like below */
  this.Dbay_format_unknown = class Dbay_format_unknown extends this.Dbay_error {
    constructor(ref, format) {
      super(ref, `unknown DB format ${ref(format)}`);
    }

  };

  this.Dbay_import_format_unknown = class Dbay_import_format_unknown extends this.Dbay_error {
    constructor(ref, format) {
      var formats;
      formats = [...(require('./types'))._import_formats].join(', ');
      super(ref, `unknown import format ${rpr(format)} (known formats are ${formats})`);
    }

  };

}).call(this);

//# sourceMappingURL=errors.js.map