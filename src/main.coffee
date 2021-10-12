
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'DBAY/MAIN'
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
types                     = require './types'
SQL                       = String.raw
guy                       = require 'guy'
new_bsqlt3_connection     = require 'better-sqlite3'
#...........................................................................................................
E                         = require './errors'
H                         = require './helpers'
{ DBay_query            } = require './query-mixin'
{ DBay_ctx              } = require './ctx-mixin'
{ DBay_openclose        } = require './open-close-mixin'
{ DBay_stdlib           } = require './stdlib-mixin'
{ DBay_sqlgen           } = require './sqlgen-mixin'
{ DBay_random           } = require './random-mixin'
{ DBay_udf              } = require './udf-mixin'
{ Sql                   } = require './sql'


#===========================================================================================================
class @DBay extends   \
  DBay_query          \
  DBay_ctx            \
  DBay_openclose      \
  DBay_stdlib         \
  DBay_sqlgen         \
  DBay_random         \
  DBay_udf            \
  Function

  #---------------------------------------------------------------------------------------------------------
  @C: guy.lft.freeze
    autolocation: H.autolocation
    symbols:
      execute: Symbol 'execute'
    defaults:
      #.....................................................................................................
      constructor_cfg:
        # _temp_prefix: '_dba_temp_'
        readonly:     false
        create:       true
        timeout:      5000
        #...................................................................................................
        overwrite:    false
        path:         null
      #.....................................................................................................
      dbay_with_transaction_cfg:
        mode:         'deferred'
      #.....................................................................................................
      dba_open_cfg:
        schema:     null
        path:       null
        # overwrite:  false
        # create:     true
      #.....................................................................................................
      dbay_create_function_cfg:
        deterministic:  true
        varargs:        false
        directOnly:     false
      #.....................................................................................................
      dbay_create_aggregate_function_cfg:
        deterministic:  true
        varargs:        false
        directOnly:     false
        start:          null
      #.....................................................................................................
      dbay_create_window_function_cfg:
        deterministic:  true
        varargs:        false
        directOnly:     false
        start:          null
      #.....................................................................................................
      dbay_create_table_function_cfg:
        deterministic:  true
        varargs:        false
        directOnly:     false
      #.....................................................................................................
      dbay_create_virtual_table_cfg: {}
      #.....................................................................................................
      dbay_create_insert_cfg:
        schema:         'main'
        into:           null
        fields:         null
        exclude:        null

  #---------------------------------------------------------------------------------------------------------
  @cast_sqlt_cfg: ( me ) ->
    ### Produce a configuration object for `better-sqlite3` from `me.cfg`. ###
    R                = guy.obj.pluck_with_fallback me.cfg, null, 'readonly', 'timeout'
    R.fileMustExist  = not me.cfg.create; delete me.cfg.create
    return R

  #---------------------------------------------------------------------------------------------------------
  @cast_constructor_cfg: ( me, cfg = null ) ->
    clasz           = me.constructor
    R               = cfg ? me.cfg
    #.......................................................................................................
    if R.path?
      R.temporary  ?= false
      R.path        = PATH.resolve R.path
    else
      R.temporary  ?= true
      filename        = me._get_random_filename()
      R.path        = PATH.resolve PATH.join clasz.C.autolocation, filename
    return R

  #---------------------------------------------------------------------------------------------------------
  @declare_types: ( me ) ->
    ### called from constructor via `guy.cfg.configure_with_types()` ###
    me.cfg        = @cast_constructor_cfg me
    me.sqlt_cfg   = @cast_sqlt_cfg        me
    me.cfg        = guy.lft.freeze guy.obj.omit_nullish me.cfg
    me.sqlt_cfg   = guy.lft.freeze guy.obj.omit_nullish me.sqlt_cfg
    me.types.validate.constructor_cfg me.cfg
    return null

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    super '...P', 'return this._me.do(...P)'
    @_me        = @bind @
    @_me.state  = guy.lft.freeze {}
    @_me.sql    = new Sql()
    @_$query_initialize?()
    @_$ctx_initialize?()
    @_$openclose_initialize?()
    @_$stdlib_initialize?()
    @_$sqlgen_initialize?()
    @_$random_initialize?()
    @_$udf_initialize?()
    guy.cfg.configure_with_types @_me, cfg, types
    #.......................................................................................................
    guy.props.def @_me, '_dbs', { enumerable: false, value: {}, }
    @_me._register_schema 'main', @_me.cfg.path, @_me.cfg.temporary
    unless @constructor._skip_sqlt
      guy.props.def @_me, 'sqlt1', { enumerable: false, value: @_me._new_bsqlt3_connection(), }
      guy.props.def @_me, 'sqlt2', { enumerable: false, value: @_me._new_bsqlt3_connection(), }
    # @_compile_sql()
    # @_create_sql_functions()
    # @_create_db_structure()
    guy.process.on_exit => @_me.destroy()
    return @_me

  #---------------------------------------------------------------------------------------------------------
  _new_bsqlt3_connection: ->
    return new_bsqlt3_connection @cfg.path, @sqlt_cfg

  #---------------------------------------------------------------------------------------------------------
  _register_schema: ( schema, path, temporary ) ->
    ### Register a schema and descriptional properties, especially whether DB file is to be removed on
    process exit. ###
    @_dbs[ schema ] = { path, temporary, }
    return null

  #=========================================================================================================
  # CLEANUP ON DEMAND, ON PROCESS EXIT
  #---------------------------------------------------------------------------------------------------------
  destroy: ->
    ### To be called on progress exit or explicitly by client code. Removes all DB files marked 'temporary'
    in `@_dbs`. ###
    try @sqlt1?.close() catch error then warn '^dbay/main@1^', error.message
    try @sqlt2?.close() catch error then warn '^dbay/main@2^', error.message
    for schema, d of @_dbs
      H.unlink_file d.path if d.temporary
    return null


