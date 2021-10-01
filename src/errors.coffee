'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'DBAY/ERRORS'
# debug                     = CND.get_logger 'debug',     badge
# warn                      = CND.get_logger 'warn',      badge
# info                      = CND.get_logger 'info',      badge
# urge                      = CND.get_logger 'urge',      badge
# help                      = CND.get_logger 'help',      badge
# whisper                   = CND.get_logger 'whisper',   badge
# echo                      = CND.echo.bind CND


#-----------------------------------------------------------------------------------------------------------
class @Dbay_error extends Error
  constructor: ( ref, message ) ->
    super()
    @message  = "#{ref} (#{@constructor.name}) #{message}"
    @ref      = ref
    return undefined ### always return `undefined` from constructor ###

#-----------------------------------------------------------------------------------------------------------
class @Dbay_cfg_error                 extends @Dbay_error
  constructor: ( ref, message )     -> super ref, message
class @Dbay_internal_error            extends @Dbay_error
  constructor: ( ref, message )     -> super ref, message
class @Dbay_schema_exists             extends @Dbay_error
  constructor: ( ref, schema )      -> super ref, "schema #{rpr schema} already exists"
class @Dbay_schema_unknown            extends @Dbay_error
  constructor: ( ref, schema )      -> super ref, "schema #{rpr schema} does not exist"
class @Dbay_object_unknown            extends @Dbay_error
  constructor: ( ref, schema, name )-> super ref, "object #{rpr schema + '.' + name} does not exist"
class @Dbay_schema_nonempty           extends @Dbay_error
  constructor: ( ref, schema )      -> super ref, "schema #{rpr schema} isn't empty"
class @Dbay_schema_not_allowed        extends @Dbay_error
  constructor: ( ref, schema )      -> super ref, "schema #{rpr schema} not allowed here"
class @Dbay_schema_repeated           extends @Dbay_error
  constructor: ( ref, schema )      -> super ref, "unable to copy schema to itself, got #{rpr schema}"
class @Dbay_expected_one_row          extends @Dbay_error
  constructor: ( ref, row_count )   -> super ref, "expected 1 row, got #{row_count}"
class @Dbay_extension_unknown         extends @Dbay_error
  constructor: ( ref, path )        -> super ref, "extension of path #{path} is not registered for any format"
class @Dbay_not_implemented           extends @Dbay_error
  constructor: ( ref, what )        -> super ref, "#{what} isn't implemented (yet)"
class @Dbay_deprecated                extends @Dbay_error
  constructor: ( ref, what )        -> super ref, "#{what} has been deprecated"
class @Dbay_unexpected_db_object_type extends @Dbay_error
  constructor: ( ref, type, value ) -> super ref, "µ769 unknown type #{rpr type} of DB object #{d}"
class @Dbay_sql_value_error           extends @Dbay_error
  constructor: ( ref, type, value ) -> super ref, "unable to express a #{type} as SQL literal, got #{rpr value}"
class @Dbay_sql_not_a_list_error      extends @Dbay_error
  constructor: ( ref, type, value ) -> super ref, "expected a list, got a #{type}"
class @Dbay_unexpected_sql            extends @Dbay_error
  constructor: ( ref, sql )         -> super ref, "unexpected SQL string #{rpr sql}"
class @Dbay_sqlite_too_many_dbs       extends @Dbay_error
  constructor: ( ref, schema )      -> super ref, "unable to attach schema #{rpr schema}: too many attached databases"
class @Dbay_sqlite_error              extends @Dbay_error
  constructor: ( ref, error )       -> super ref, "#{error.code ? 'SQLite error'}: #{error.message}"
class @Dbay_no_arguments_allowed      extends @Dbay_error
  constructor: ( ref, name, arity ) -> super ref, "method #{name} doesn't take arguments, got #{arity}"
class @Dbay_argument_not_allowed      extends @Dbay_error
  constructor: ( ref, name, value ) -> super ref, "argument #{name} not allowed, got #{rpr value}"
class @Dbay_wrong_type                extends @Dbay_error
  constructor: ( ref, types, type ) -> super ref, "expected #{types}, got a #{type}"
class @Dbay_wrong_arity               extends @Dbay_error
  constructor: ( ref, name, min, max, found ) -> super ref, "#{name} expected between #{min} and #{max} arguments, got #{found}"
class @Dbay_empty_csv                 extends @Dbay_error
  constructor: ( ref, path )        -> super ref, "no CSV records found in file #{path}"
class @Dbay_interpolation_format_unknown extends @Dbay_error
  constructor: ( ref, format )      -> super ref, "unknown interpolation format #{rpr format}"
class @Dbay_no_nested_transactions    extends @Dbay_error
  constructor: ( ref )              -> super ref, "cannot start a transaction within a transaction"
class @Dbay_no_deferred_fks_in_tx     extends @Dbay_error
  constructor: ( ref )              -> super ref, "cannot defer foreign keys inside a transaction"

### TAINT replace with more specific error, like below ###
class @Dbay_format_unknown extends @Dbay_error
  constructor: ( ref, format ) ->
    super ref, "unknown DB format #{ref format}"

class @Dbay_import_format_unknown extends @Dbay_error
  constructor: ( ref, format ) ->
    formats = [ ( require './types' )._import_formats..., ].join ', '
    super ref, "unknown import format #{rpr format} (known formats are #{formats})"

