

'use strict'

############################################################################################################
E                         = require './errors'
SQL                       = String.raw
GUY                       = require 'guy'


#===========================================================================================================
# CHECK, GETS, SETS
#-----------------------------------------------------------------------------------------------------------
@DBay_ctx = ( clasz = Object ) => class extends clasz

  #---------------------------------------------------------------------------------------------------------
  _$ctx_initialize: ->
    @_me.state = GUY.lft.lets @_me.state, ( d ) -> d.in_unsafe_mode = false
    return null

  #=========================================================================================================
  # JOURNAL MODE
  #---------------------------------------------------------------------------------------------------------
  get_journal_mode: -> ( @pragma "journal_mode;" )[ 0 ].journal_mode

  #---------------------------------------------------------------------------------------------------------
  set_journal_mode: ( journal_mode ) ->
    @types.validate.dbay_journal_mode journal_mode
    @pragma "journal_mode = #{journal_mode};"
    return null

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
  get_unsafe_mode: -> @state.in_unsafe_mode

  #---------------------------------------------------------------------------------------------------------
  set_unsafe_mode: ( onoff ) ->
    @types.validate.boolean onoff
    @sqlt1.unsafeMode onoff
    @state = GUY.lft.lets @state, ( d ) -> d.in_unsafe_mode = onoff
    return null


  #=========================================================================================================
  # TRANSACTIONS
  #---------------------------------------------------------------------------------------------------------
  within_transaction:   -> @sqlt1.inTransaction
  begin_transaction:    -> @sqlt1.exec "begin;"
  commit_transaction:   -> @sqlt1.exec "commit;"
  rollback_transaction: -> @sqlt1.exec "rollback;"


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
      else throw new E.DBay_wrong_arity '^dbay/ctx@4^', 'with_transaction()', 1, 2, arity
    @types.validate.dbay_with_transaction_cfg ( cfg = { @constructor.C.defaults.dbay_with_transaction_cfg..., cfg..., } )
    @types.validate.function f
    throw new E.DBay_no_nested_transactions '^dbay/ctx@5^' if @sqlt1.inTransaction
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
      # try @execute SQL"rollback;" if @sqlt1.inTransaction catch error then null
    return R

  #---------------------------------------------------------------------------------------------------------
  with_unsafe_mode: ( f ) ->
    @types.validate.function f
    unsafe_mode_state = @get_unsafe_mode()
    @set_unsafe_mode true
    try
      R = f()
    finally
      @set_unsafe_mode unsafe_mode_state
    return R

  #---------------------------------------------------------------------------------------------------------
  with_foreign_keys_deferred: ( f ) ->
    @types.validate.function f
    R = null
    throw new E.DBay_no_deferred_fks_in_tx '^dbay/ctx@6^' if @sqlt1.inTransaction
    @with_transaction =>
      @sqlt1.pragma SQL"defer_foreign_keys=true"
      R = f()
    return R

  #---------------------------------------------------------------------------------------------------------
  with_deferred_write: ( f ) ->
    buffer  = []
    write   = ( P... ) -> buffer.push P
    f write
    if @within_transaction
      @ P... for P in buffer
    else
      @ ->
        @ P... for P in buffer
    return null


