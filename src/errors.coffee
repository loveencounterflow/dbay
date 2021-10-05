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
class @DBay_error extends Error
  constructor: ( ref, message ) ->
    super()
    @message  = "#{ref} (#{@constructor.name}) #{message}"
    @ref      = ref
    return undefined ### always return `undefined` from constructor ###

#-----------------------------------------------------------------------------------------------------------
class @DBay_cfg_error                 extends @DBay_error
  constructor: ( ref, message )     -> super ref, message
class @DBay_internal_error            extends @DBay_error
  constructor: ( ref, message )     -> super ref, message
class @DBay_schema_exists             extends @DBay_error
  constructor: ( ref, schema )      -> super ref, "schema #{rpr schema} already exists"
class @DBay_schema_unknown            extends @DBay_error
  constructor: ( ref, schema )      -> super ref, "schema #{rpr schema} does not exist"
class @DBay_object_unknown            extends @DBay_error
  constructor: ( ref, schema, name )-> super ref, "object #{rpr schema + '.' + name} does not exist"
class @DBay_schema_nonempty           extends @DBay_error
  constructor: ( ref, schema )      -> super ref, "schema #{rpr schema} isn't empty"
class @DBay_schema_not_allowed        extends @DBay_error
  constructor: ( ref, schema )      -> super ref, "schema #{rpr schema} not allowed here"
class @DBay_schema_repeated           extends @DBay_error
  constructor: ( ref, schema )      -> super ref, "unable to copy schema to itself, got #{rpr schema}"
class @DBay_expected_single_row       extends @DBay_error
  constructor: ( ref, row_count )   -> super ref, "expected 1 row, got #{row_count}"
class @DBay_expected_single_value       extends @DBay_error
  constructor: ( ref, keys )        -> super ref, "expected row with single field, got fields #{rpr keys}"
class @DBay_extension_unknown         extends @DBay_error
  constructor: ( ref, path )        -> super ref, "extension of path #{path} is not registered for any format"
class @DBay_not_implemented           extends @DBay_error
  constructor: ( ref, what )        -> super ref, "#{what} isn't implemented (yet)"
class @DBay_deprecated                extends @DBay_error
  constructor: ( ref, what )        -> super ref, "#{what} has been deprecated"
class @DBay_unexpected_db_object_type extends @DBay_error
  constructor: ( ref, type, value ) -> super ref, "µ769 unknown type #{rpr type} of DB object #{d}"
class @DBay_sql_value_error           extends @DBay_error
  constructor: ( ref, type, value ) -> super ref, "unable to express a #{type} as SQL literal, got #{rpr value}"
class @DBay_sql_not_a_list_error      extends @DBay_error
  constructor: ( ref, type, value ) -> super ref, "expected a list, got a #{type}"
class @DBay_unexpected_sql            extends @DBay_error
  constructor: ( ref, sql )         -> super ref, "unexpected SQL string #{rpr sql}"
class @DBay_sqlite_too_many_dbs       extends @DBay_error
  constructor: ( ref, schema )      -> super ref, "unable to attach schema #{rpr schema}: too many attached databases"
class @DBay_sqlite_error              extends @DBay_error
  constructor: ( ref, error )       -> super ref, "#{error.code ? 'SQLite error'}: #{error.message}"
class @DBay_no_arguments_allowed      extends @DBay_error
  constructor: ( ref, name, arity ) -> super ref, "method #{name} doesn't take arguments, got #{arity}"
class @DBay_argument_not_allowed      extends @DBay_error
  constructor: ( ref, name, value ) -> super ref, "argument #{name} not allowed, got #{rpr value}"
class @DBay_wrong_type                extends @DBay_error
  constructor: ( ref, types, type ) -> super ref, "expected #{types}, got a #{type}"
class @DBay_wrong_arity               extends @DBay_error
  constructor: ( ref, name, min, max, found ) -> super ref, "#{name} expected between #{min} and #{max} arguments, got #{found}"
class @DBay_empty_csv                 extends @DBay_error
  constructor: ( ref, path )        -> super ref, "no CSV records found in file #{path}"
class @DBay_interpolation_format_unknown extends @DBay_error
  constructor: ( ref, format )      -> super ref, "unknown interpolation format #{rpr format}"
class @DBay_no_nested_transactions    extends @DBay_error
  constructor: ( ref )              -> super ref, "cannot start a transaction within a transaction"
class @DBay_no_deferred_fks_in_tx     extends @DBay_error
  constructor: ( ref )              -> super ref, "cannot defer foreign keys inside a transaction"

### TAINT replace with more specific error, like below ###
class @DBay_format_unknown extends @DBay_error
  constructor: ( ref, format ) ->
    super ref, "unknown DB format #{ref format}"

class @DBay_import_format_unknown extends @DBay_error
  constructor: ( ref, format ) ->
    formats = [ ( require './types' )._import_formats..., ].join ', '
    super ref, "unknown import format #{rpr format} (known formats are #{formats})"

