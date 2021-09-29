
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
types                     = new ( require 'intertype' ).Intertype
{ isa
  type_of
  validate
  validate_list_of }      = types.export()
SQL                       = String.raw
guy                       = require 'guy'
E                         = require './errors'
new_bsqlt3_connection     = require 'better-sqlite3'
H                         = require './helpers'
#...........................................................................................................
{ Dbay_random }           = require './random-mixin'
{ Dbay_query }            = require './query-mixin'


#-----------------------------------------------------------------------------------------------------------
types.declare 'constructor_cfg', tests:
  "@isa.object x":                            ( x ) -> @isa.object x
  "@isa.nonempty_text x.path":                ( x ) -> @isa.nonempty_text x.path
  "@isa.boolean x.temporary":                 ( x ) -> @isa.boolean x.temporary



#===========================================================================================================
class @Dbay extends Dbay_query Dbay_random()

  #---------------------------------------------------------------------------------------------------------
  @C: guy.lft.freeze
    autolocation: H.autolocation
    defaults:
      constructor_cfg:
        # _temp_prefix: '_dba_temp_'
        readonly:     false
        create:       true
        timeout:      5000
        #...................................................................................................
        overwrite:    false
        path:         null

  #---------------------------------------------------------------------------------------------------------
  @cast_sqlt_cfg: ( self ) ->
    ### Produce a configuration object for `better-sqlite3` from `self.cfg`. ###
    R                = guy.obj.pluck_with_fallback self.cfg, null, 'readonly', 'timeout'
    R.fileMustExist  = not self.cfg.create; delete self.cfg.create
    return R

  #---------------------------------------------------------------------------------------------------------
  @cast_constructor_cfg: ( self ) ->
    clasz           = self.constructor
    R               = self.cfg
    #.......................................................................................................
    if R.path?
      R.temporary  ?= false
      R.path        = PATH.resolve R.path
    else
      R.temporary  ?= true
      filename        = self._get_random_filename()
      R.path        = PATH.resolve PATH.join clasz.C.autolocation, filename
    return R

  #---------------------------------------------------------------------------------------------------------
  @declare_types: ( self ) ->
    ### called from constructor via `guy.cfg.configure_with_types()` ###
    self.cfg        = @cast_constructor_cfg self
    self.sqlt_cfg   = @cast_sqlt_cfg        self
    self.cfg        = guy.lft.freeze guy.obj.omit_nullish self.cfg
    self.sqlt_cfg   = guy.lft.freeze guy.obj.omit_nullish self.sqlt_cfg
    self.types.validate.constructor_cfg self.cfg
    return null

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    super()
    guy.cfg.configure_with_types @, cfg, types
    @_register_schema 'main', @cfg.path, @cfg.temporary
    #.......................................................................................................
    unless @constructor._skip_sqlt
      guy.props.def @, 'sqlt1', { enumerable: false, value: @_new_bsqlt3_connection(), }
      guy.props.def @, 'sqlt2', { enumerable: false, value: @_new_bsqlt3_connection(), }
    # @_compile_sql()
    # @_create_sql_functions()
    # @_create_db_structure()
    guy.process.on_exit => @destroy()
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _new_bsqlt3_connection: ->
    return new_bsqlt3_connection @cfg.path, @sqlt_cfg

  #---------------------------------------------------------------------------------------------------------
  _register_schema: ( schema, path, temporary ) ->
    ### Register a schema and descriptional properties, especially whether DB file is to be removed on
    process exit. ###
    guy.props.def @, '_dbs', { enumerable: false, value: {}, } unless @_dbs?
    @_dbs[ schema ] = { path, temporary, }
    return null

  #=========================================================================================================
  # CLEANUP ON DEMAND, ON PROCESS EXIT
  #---------------------------------------------------------------------------------------------------------
  destroy: ->
    ### To be called on progress exit or explicitly by client code. Removes all DB files marked 'temporary'
    in `@_dbs`. ###
    try @sqlt1.close() catch error then warn '^dbay@1^', error.message
    try @sqlt2.close() catch error then warn '^dbay@1^', error.message
    for schema, d of @_dbs
      H.unlink_file d.path if d.temporary
    return null


