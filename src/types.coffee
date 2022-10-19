


'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'DBAY/TYPES'
debug                     = CND.get_logger 'debug',     badge
alert                     = CND.get_logger 'alert',     badge
whisper                   = CND.get_logger 'whisper',   badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
info                      = CND.get_logger 'info',      badge
jr                        = JSON.stringify
Intertype                 = ( require 'intertype' ).Intertype
intertype                 = new Intertype module.exports


#-----------------------------------------------------------------------------------------------------------
@declare 'dbay_schema', ( x ) ->
  ### NOTE to keep things simple, only allow lower case ASCII letters, digits, underscores in schemas ###
  return false unless @isa.text x
  return ( /^[a-z_][a-z0-9_]*$/ ).test x

#-----------------------------------------------------------------------------------------------------------
@declare 'dbay_usr_schema',     ( x ) -> ( @isa.dbay_schema x ) and ( x not in [ 'main', 'temp', ] )
@declare 'dbay_path',           ( x ) -> @isa.text x
@declare 'dbay_name',           ( x ) -> @isa.nonempty_text x

#-----------------------------------------------------------------------------------------------------------
@declare 'constructor_cfg', tests:
  "@isa.object x":                            ( x ) -> @isa.object x
  "@isa.nonempty_text x.path":                ( x ) -> @isa.nonempty_text x.path
  "@isa.boolean x.temporary":                 ( x ) -> @isa.boolean x.temporary
  # "@isa.boolean x.create_stdlib":             ( x ) -> @isa.boolean x.create_stdlib
  "x.random_seed  may be set":                ( x ) -> true
  "x.random_delta may be set":                ( x ) -> true
  "@isa.boolean x.macros":                    ( x ) -> @isa.boolean x.macros

#-----------------------------------------------------------------------------------------------------------
@declare 'dbay_with_transaction_cfg', tests:
  "@isa.object x":                                    ( x ) -> @isa.object x
  "x.mode in [ 'deferred', 'immediate', 'exclusive', ]": \
    ( x ) -> x.mode in [ 'deferred', 'immediate', 'exclusive', ]

#-----------------------------------------------------------------------------------------------------------
@declare 'dbay_open_cfg', tests:
  "@isa.object x":                        ( x ) -> @isa.object x
  "@isa.dbay_usr_schema x.schema":        ( x ) -> @isa.dbay_usr_schema x.schema
  "@isa_optional.dbay_path x.path":       ( x ) -> @isa_optional.dbay_path x.path
  "@isa.boolean x.temporary":             ( x ) -> @isa.boolean x.temporary
  # "@isa.boolean x.overwrite":             ( x ) -> @isa.boolean x.overwrite
  # "@isa.boolean x.create":                ( x ) -> @isa.boolean x.create


#===========================================================================================================
# UDF
#-----------------------------------------------------------------------------------------------------------
@declare 'dbay_create_function_cfg', tests:
  "@isa.object x":                  ( x ) -> @isa.object x
  "@isa.nonempty_text x.name":      ( x ) -> @isa.nonempty_text x.name
  "@isa.function x.call":           ( x ) -> @isa.function x.call
  "@isa.boolean x.deterministic":   ( x ) -> @isa.boolean x.deterministic
  "@isa.boolean x.varargs":         ( x ) -> @isa.boolean x.varargs
  "@isa.boolean x.directOnly":      ( x ) -> @isa.boolean x.directOnly

#-----------------------------------------------------------------------------------------------------------
@declare 'dbay_create_aggregate_function_cfg', tests:
  "@isa.object x":                  ( x ) -> @isa.object x
  "@isa.nonempty_text x.name":      ( x ) -> @isa.nonempty_text x.name
  # "@isa.any x.start":               ( x ) -> @isa.any x.start
  "@isa.function x.step":           ( x ) -> @isa.function x.step
  "@isa.boolean x.deterministic":   ( x ) -> @isa.boolean x.deterministic
  "@isa.boolean x.varargs":         ( x ) -> @isa.boolean x.varargs
  "@isa.boolean x.directOnly":      ( x ) -> @isa.boolean x.directOnly

#-----------------------------------------------------------------------------------------------------------
@declare 'dbay_create_window_function_cfg', tests:
  "@isa.object x":                    ( x ) -> @isa.object x
  "@isa.nonempty_text x.name":        ( x ) -> @isa.nonempty_text x.name
  # "@isa.any x.start":                 ( x ) -> @isa.any x.start
  "@isa.function x.step":             ( x ) -> @isa.function x.step
  "@isa.function x.inverse":          ( x ) -> @isa.function x.inverse
  "@isa_optional.function x.result":  ( x ) -> @isa_optional.function x.result
  "@isa.boolean x.deterministic":     ( x ) -> @isa.boolean x.deterministic
  "@isa.boolean x.varargs":           ( x ) -> @isa.boolean x.varargs
  "@isa.boolean x.directOnly":        ( x ) -> @isa.boolean x.directOnly

#-----------------------------------------------------------------------------------------------------------
@declare 'dbay_create_table_function_cfg', tests:
  "@isa.object x":                    ( x ) -> @isa.object x
  "@isa.nonempty_text x.name":        ( x ) -> @isa.nonempty_text x.name
  "@isa_optional.list x.columns":     ( x ) -> @isa_optional.list x.columns
  "@isa_optional.list x.parameters":  ( x ) -> @isa_optional.list x.parameters
  "@isa.generatorfunction x.rows":    ( x ) -> @isa.generatorfunction x.rows
  "@isa.boolean x.deterministic":     ( x ) -> @isa.boolean x.deterministic
  "@isa.boolean x.varargs":           ( x ) -> @isa.boolean x.varargs
  "@isa.boolean x.directOnly":        ( x ) -> @isa.boolean x.directOnly

#-----------------------------------------------------------------------------------------------------------
@declare 'dbay_create_virtual_table_cfg', tests:
  "@isa.object x":                    ( x ) -> @isa.object x
  "@isa.nonempty_text x.name":        ( x ) -> @isa.nonempty_text x.name
  "@isa.function x.create":           ( x ) -> @isa.function x.create

#-----------------------------------------------------------------------------------------------------------
@declare 'dbay_execute_file_cfg', tests:
  "@isa.object x":                    ( x ) -> @isa.object x
  "@isa.nonempty_text x.path":        ( x ) -> @isa.nonempty_text x.path
  "@isa.nonempty_text x.encoding":    ( x ) -> @isa.nonempty_text x.encoding



#===========================================================================================================
# SQLGEN
#-----------------------------------------------------------------------------------------------------------
@declare 'dbay_create_insert_on_conflict_cfg', ( x ) ->

#-----------------------------------------------------------------------------------------------------------
@declare 'dbay_create_insert_cfg', tests:
  "@isa.object x":                                          ( x ) -> @isa.object x
  "@isa.dbay_schema x.schema":                              ( x ) -> @isa.dbay_schema x.schema
  "@isa.dbay_name x.into":                                  ( x ) -> @isa.dbay_name x.into
  "@isa_optional.nonempty_text x.returning":                ( x ) -> @isa_optional.nonempty_text x.returning
  "x.on_conflict is an optional nonempty_text or suitable object":  ( x ) ->
    return true unless x.on_conflict?
    return true if @isa.nonempty_text x.on_conflict
    return false unless @isa.object x.on_conflict
    return false unless x.on_conflict.update is true
    return true
  "either x.fields or x.exclude may be a nonempty list of nonempty_texts": ( x ) ->
    if x.fields?
      return false if x.exclude?
      return false unless @isa.list x.fields
      return false unless x.fields.length > 0
      return false unless x.fields.every ( e ) => @isa.nonempty_text e
      return true
    if x.exclude?
      return false unless @isa.list x.exclude
      return false unless x.exclude.length > 0
      return false unless x.exclude.every ( e ) => @isa.nonempty_text e
      return true
    return true

#===========================================================================================================
# DT
#-----------------------------------------------------------------------------------------------------------
@declare 'dbay_dt_valid_dayjs', tests:
  "( @type_of x ) is 'm'":  ( x ) -> ( @type_of x ) is 'm'
  "@isa.float x.$y":        ( x ) -> @isa.float x.$y
  "@isa.float x.$M":        ( x ) -> @isa.float x.$M
  "@isa.float x.$D":        ( x ) -> @isa.float x.$D
  "@isa.float x.$W":        ( x ) -> @isa.float x.$W
  "@isa.float x.$H":        ( x ) -> @isa.float x.$H
  "@isa.float x.$m":        ( x ) -> @isa.float x.$m
  "@isa.float x.$s":        ( x ) -> @isa.float x.$s
  "@isa.float x.$ms":       ( x ) -> @isa.float x.$ms

#-----------------------------------------------------------------------------------------------------------
@declare 'dbay_dt_timestamp', tests:
  "@isa.text x":                    ( x ) -> @isa.text x
  "( /^\\d{8}-\\d{6}Z$/ ).test x":  ( x ) -> ( /^\d{8}-\d{6}Z$/ ).test x

#-----------------------------------------------------------------------------------------------------------
@declare 'dba_dt_now_cfg', tests:
  "@isa.object x":                    ( x ) -> @isa.object x

