

'use strict'

############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'DBAY/MIXIN/TX'
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
info                      = CND.get_logger 'info',      badge
urge                      = CND.get_logger 'urge',      badge
help                      = CND.get_logger 'help',      badge
whisper                   = CND.get_logger 'whisper',   badge
echo                      = CND.echo.bind CND
#...........................................................................................................
PATH                      = require 'path'
FS                        = require 'fs'
E                         = require './errors'
SQL                       = String.raw
guy                       = require 'guy'


#===========================================================================================================
# CHECK, GETS, SETS
#-----------------------------------------------------------------------------------------------------------
@Dbay_tx = ( clasz = Object ) => class extends clasz

  #---------------------------------------------------------------------------------------------------------
  # _$tx_initialize: ->

  #=========================================================================================================
  # FOREIGN KEYS MODE, DEFERRED
  #---------------------------------------------------------------------------------------------------------
  get_foreign_keys_state: -> not not ( @pragma "foreign_keys;" )[ 0 ].foreign_keys

  #---------------------------------------------------------------------------------------------------------
  set_foreign_keys_state: ( onoff ) ->
    @types.validate.boolean onoff
    @pragma "foreign_keys = #{onoff};"
    return null

  #---------------------------------------------------------------------------------------------------------
  ### TAINT add schema, table_name; currently only works for main(?) ###
  check_foreign_keys: -> @pragma SQL"foreign_key_check;"

  #---------------------------------------------------------------------------------------------------------
  set_foreign_keys_deferred: ( onoff ) -> @types.validate.boolean onoff; @pragma SQL"defer_foreign_keys=#{onoff};"
  get_foreign_keys_deferred: -> not not ( @pragma SQL"defer_foreign_keys;" )?[ 0 ]?.defer_foreign_keys

  #=========================================================================================================
  # UNSAFE MODE
  #---------------------------------------------------------------------------------------------------------
  get_unsafe_mode: -> @_state.in_unsafe_mode

  #---------------------------------------------------------------------------------------------------------
  set_unsafe_mode: ( onoff ) ->
    @types.validate.boolean onoff
    @sqlt.unsafeMode onoff
    @_state = lets @_state, ( d ) -> d.in_unsafe_mode = onoff
    return null


  #=========================================================================================================
  # TRANSACTIONS
  #---------------------------------------------------------------------------------------------------------
  within_transaction:   -> @sqlt.inTransaction
  begin_transaction:    -> throw new E.Dbay_not_implemented '^dbay/tx@1^', "tx_begin"
  commit_transaction:   -> throw new E.Dbay_not_implemented '^dbay/tx@2^', "tx_commit"
  rollback_transaction: -> throw new E.Dbay_not_implemented '^dbay/tx@3^', "tx_rollback"


  #=========================================================================================================
  # INTEGRITY
  #---------------------------------------------------------------------------------------------------------
  check_integrity:    -> @pragma SQL"integrity_check;"
  check_quick:        -> @pragma SQL"quick_check;"


  #=========================================================================================================
  # CONTEXT HANDLERS
  #---------------------------------------------------------------------------------------------------------
  with_transaction: ( cfg, f ) ->
    switch arity = arguments.length
      when 1 then [ cfg, f, ] = [ null, cfg, ]
      when 2 then null
      else throw new E.Dbay_wrong_arity '^dbay/tx@4^', 'with_transaction()', 1, 2, arity
    @types.validate.dbay_with_transaction_cfg ( cfg = { @constructor.C.defaults.dbay_with_transaction_cfg..., cfg..., } )
    @types.validate.function f
    throw new E.Dbay_no_nested_transactions '^dbay/tx@5^' if @sqlt1.inTransaction
    @execute SQL"begin #{cfg.mode} transaction;"
    error = null
    try
      R = f()
    catch error
      @execute SQL"rollback;" if @sqlt1.inTransaction
      throw error
    try
      @execute SQL"commit;"   if @sqlt1.inTransaction
    catch error
      @execute SQL"rollback;" if @sqlt1.inTransaction
    return null

  # #---------------------------------------------------------------------------------------------------------
  # with_unsafe_mode: ( f ) ->
  #   @types.validate.function f
  #   unsafe_mode_state = @get_unsafe_mode()
  #   @set_unsafe_mode true
  #   try
  #     R = f()
  #   finally
  #     @set_unsafe_mode unsafe_mode_state
  #   return R

  # #---------------------------------------------------------------------------------------------------------
  # with_foreign_keys_deferred: ( f ) ->
  #   @types.validate.function f
  #   R = null
  #   throw new E.Dbay_no_deferred_fks_in_tx '^dbay/tx@6^' if @sqlt.inTransaction
  #   @with_transaction =>
  #     @sqlt.pragma SQL"defer_foreign_keys=true"
  #     R = f()
  #   return R




