
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


#-----------------------------------------------------------------------------------------------------------
types.declare 'constructor_cfg', tests:
  "@isa.object x":                            ( x ) -> @isa.object x
  "@isa_optional.nonempty_text x.location":   ( x ) -> @isa_optional.nonempty_text x.location
  "@isa_optional.nonempty_text x.name":       ( x ) -> @isa_optional.nonempty_text x.name
  "@isa_optional.nonempty_text x.path":       ( x ) -> @isa_optional.nonempty_text x.path
  "@isa_optional.boolean x.temporary":        ( x ) -> @isa_optional.boolean x.temporary



#===========================================================================================================
class @Dbay extends H.Dbay_rnd

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
    # debug '^344476^', self.cfg
    clasz           = self.constructor
    cfg             = self.cfg
    #.......................................................................................................
    if cfg.path?
      cfg.temporary  ?= false
      cfg.path        = PATH.resolve cfg.path
    else
      cfg.temporary  ?= true
      filename        = self._get_random_filename()
      cfg.path        = PATH.resolve PATH.join clasz.C.autolocation, filename
    if cfg.temporary
      guy.process.on_exit ->
        try
          FS.unlinkSync cfg.path
        catch error
          warn '^dbay@1^', error.message unless error.code is 'ENOENT'
        return null
    self.sqlt_cfg   = guy.lft.freeze guy.obj.omit_nullish @cast_sqlt_cfg self
    self.cfg        = guy.lft.freeze guy.obj.omit_nullish cfg
    return null

  #---------------------------------------------------------------------------------------------------------
  @declare_types: ( self ) ->
    @cast_constructor_cfg self
    # self.types.validate.constructor_cfg self.cfg
    # # guy.props.def self, 'dba', { enumerable: false, value: self.cfg.dba, }
    ### called from constructor via `guy.cfg.configure_with_types()` ###
    return null

  #---------------------------------------------------------------------------------------------------------
  _new_bsqlt3_connection: ->
    path_or_url = if @cfg.ram then @cfg.url else @cfg.path
    return new_bsqlt3_connection path_or_url, @sqlt_cfg

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    super()
    cfg             = { cfg..., }
    # @_signature     = H.get_cfg_signature cfg
    guy.cfg.configure_with_types @, cfg, types
    debug '^344476^', @cfg
    unless @constructor._skip_sqlt
      guy.props.def @, 'sqlt1', { enumerable: false, value: @_new_bsqlt3_connection(), }
      guy.props.def @, 'sqlt2', { enumerable: false, value: @_new_bsqlt3_connection(), }
    # delete @_signature
    # @_compile_sql()
    # @_create_sql_functions()
    # @_create_db_structure()
    return undefined

    ### Register a schema and descriptional properties, especially whether DB file is to be removed on
    process exit. ###
    ### Given a `path`, unlink the associated file; in case no file is found, ignore silently. If an error
    occurs, just print a warning. To be used in an exit handler, so no error handling makes sense here. ###
    ### To be called on progress exit or explicitly by client code. Removes all DB files marked 'temporary'
    in `@_dbs`. ###

