

'use strict'

############################################################################################################
GUY                       = require 'guy'


#-----------------------------------------------------------------------------------------------------------
@DBay_udf = ( clasz = Object ) => class extends clasz

  #---------------------------------------------------------------------------------------------------------
  _$udf_initialize: ->
    @_me._udf_catalog = {}

  #---------------------------------------------------------------------------------------------------------
  _register_udf: ( udf_type, cfg ) ->
    ### TAINT validate more thoroughly, especially cfg._dba_udf_type ###
    ### TAINT consider to use (virtual?) table for this ###
    @types.validate.nonempty_text udf_type
    @types.validate.object cfg
    @types.validate.nonempty_text cfg.name
    { name, } = cfg
    switch udf_type
      when 'single_valued'
        entry =
          name:   name
          arity:  cfg.call.length ### TAINT respect varargs ###
      else
        entry =
          name:   name
          cfg:    cfg
    @_udf_catalog = GUY.lft.lets @_udf_catalog, ( d ) -> d[ cfg.name ] = entry
    return null

  #=========================================================================================================
  # USER-DEFINED FUNCTIONS
  #---------------------------------------------------------------------------------------------------------
  create_function: ( cfg ) ->
    @types.validate.dbay_create_function_cfg ( cfg = { @constructor.C.defaults.dbay_create_function_cfg..., cfg..., } )
    { name
      call
      directOnly
      deterministic
      varargs }     = cfg
    @sqlt1.function     name, { deterministic, varargs, directOnly, }, call
    @alt.sqlt1.function name, { deterministic, varargs, directOnly, }, call
    @_register_udf 'single_valued', cfg
    return null

  #---------------------------------------------------------------------------------------------------------
  create_aggregate_function: ( cfg ) ->
    @types.validate.dbay_create_aggregate_function_cfg ( cfg = { @constructor.C.defaults.dbay_create_aggregate_function_cfg..., cfg..., } )
    { name
      start
      step
      result
      directOnly
      deterministic
      varargs }     = cfg
    @sqlt1.aggregate      name, { start, step, result, deterministic, varargs, directOnly, }
    @alt.sqlt1.aggregate  name, { start, step, result, deterministic, varargs, directOnly, }
    @_register_udf 'aggregate', cfg
    return null

  #---------------------------------------------------------------------------------------------------------
  create_window_function: ( cfg ) ->
    @types.validate.dbay_create_window_function_cfg ( cfg = { @constructor.C.defaults.dbay_create_window_function_cfg..., cfg..., } )
    { name
      start
      step
      inverse
      result
      directOnly
      deterministic
      varargs }     = cfg
    @sqlt1.aggregate      name, { start, step, inverse, result, deterministic, varargs, directOnly, }
    @alt.sqlt1.aggregate  name, { start, step, inverse, result, deterministic, varargs, directOnly, }
    @_register_udf 'window', cfg
    return null

  #---------------------------------------------------------------------------------------------------------
  create_table_function: ( cfg ) ->
    @types.validate.dbay_create_table_function_cfg ( cfg = { @constructor.C.defaults.dbay_create_table_function_cfg..., cfg..., } )
    { name
      parameters
      columns
      rows
      directOnly
      deterministic
      varargs }     = cfg
    @sqlt1.table      name, { parameters, columns, rows, deterministic, varargs, directOnly, }
    @alt.sqlt1.table  name, { parameters, columns, rows, deterministic, varargs, directOnly, }
    @_register_udf 'table_function', cfg
    return null

  #---------------------------------------------------------------------------------------------------------
  create_virtual_table: ( cfg ) ->
    @types.validate.dbay_create_virtual_table_cfg ( cfg = { @constructor.C.defaults.dbay_create_virtual_table_cfg..., cfg..., } )
    { name, create, } = cfg
    @sqlt1.table      name, create
    @alt.sqlt1.table  name, create
    @_register_udf 'virtual_table', cfg
    return null


