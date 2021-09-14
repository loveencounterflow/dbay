
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
types                     = new ( require 'intertype' ).Intertype
{ isa
  type_of
  validate
  validate_list_of }      = types.export()
SQL                       = String.raw
guy                       = require 'guy'
E                         = require './errors'
new_bsqlt3_connection     = require 'better-sqlite3'

#-----------------------------------------------------------------------------------------------------------
types.declare 'dbay_urlsafe_word', tests:
  "@isa.nonempty_text x":                 ( x ) -> @isa.nonempty_text x
  "/^[a-zA-Z0-9_]+$/.test x":             ( x ) -> /^[a-zA-Z0-9_]+$/.test x

#-----------------------------------------------------------------------------------------------------------
types.declare 'constructor_cfg', tests:
  "@isa.object x":                            ( x ) -> @isa.object x
  "@isa_optional.boolean x.ram":              ( x ) -> @isa_optional.boolean x.ram
  "@isa_optional.nonempty_text x.url":        ( x ) -> @isa_optional.nonempty_text x.url
  "@isa_optional.nonempty_text x.path":       ( x ) -> @isa_optional.nonempty_text x.path
  "@isa_optional.dbay_urlsafe_word x.dbnick": ( x ) -> @isa_optional.dbay_urlsafe_word x.dbnick

class @Dbay

  #---------------------------------------------------------------------------------------------------------
  @C: guy.lft.freeze
    defaults:
      constructor_cfg:
        # _temp_prefix: '_dba_temp_'
        readonly:     false
        create:       true
        timeout:      5000
        #...................................................................................................
        overwrite:    false
        ram:          null
        path:         null
        dbnick:       null

  #---------------------------------------------------------------------------------------------------------
  @cast_sqlt_cfg: ( self ) ->
    R                = guy.obj.pluck_with_fallback self.cfg, null, 'readonly', 'timeout'
    R.fileMustExist  = not self.cfg.create; delete self.cfg.create
    return R

  #---------------------------------------------------------------------------------------------------------
  @cast_constructor_cfg: ( self ) ->
    # debug '^344476^', self
    # debug '^344476^', self.cfg
    if ( self.cfg.ram is false ) and ( not self.cfg.path? )
      throw new E.Dbay_cfg_error '^dba@1^', "missing argument `path`, got #{rpr self.cfg}"
    self.cfg.ram ?= not self.cfg.path?
    if ( not self.cfg.ram ) and self.cfg.path? and self.cfg.dbnick?
      throw new E.Dbay_cfg_error '^dba@1^', "only RAM DB can have both `path` and `dbnick`, got #{rpr self.cfg}"
    if self.cfg.ram
      { dbnick
        url    }        = self._get_connection_url self.cfg.dbnick ? null
      self.cfg.dbnick  ?= dbnick
      self.cfg.url      = url
    else
      self.cfg.url      = null
    # self.cfg = guy.obj.nullify_undefined self.cfg
    self.sqlt_cfg = guy.lft.freeze guy.obj.omit_nullish @cast_sqlt_cfg self
    self.cfg      = guy.lft.freeze guy.obj.omit_nullish self.cfg
    return null

  #---------------------------------------------------------------------------------------------------------
  @declare_types: ( self ) ->
    # debug '^133^', self.cfg, Object.isFrozen self.cfg
    @cast_constructor_cfg self
    self.types.validate.constructor_cfg self.cfg
    # guy.props.def self, 'dba', { enumerable: false, value: self.cfg.dba, }
    return null

  #---------------------------------------------------------------------------------------------------------
  _new_bsqlt3_connection: ->
    path_or_url = if @cfg.ram then @cfg.url else @cfg.path
    return new_bsqlt3_connection path_or_url, @sqlt_cfg

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    # super()
    @_initialize_prng()
    guy.cfg.configure_with_types @, cfg, types
    @sqlt1 = @_new_bsqlt3_connection()
    @sqlt2 = @_new_bsqlt3_connection()
    # @_compile_sql()
    # @_create_sql_functions()
    # @_create_db_structure()
    return undefined


  #=========================================================================================================
  # RANDOM NUMBER GENERATION
  # seedable for testing purposes
  #---------------------------------------------------------------------------------------------------------
  ### To obtain a class with a seedable PRNG that emits repeatable sequences, define class property
  `@_rnd_int_cfg: { seed, delta, }` where both seed and delta can be arbitrary finite numbers. **NOTE**
  very small `delta` values (like 1e-10) may cause adjacent numbers to be close together or even repeat. To
  use default values for both parameters, set `@_rnd_int_cfg: true`.###
  @_rnd_int_cfg: null
  _initialize_prng: ->
    clasz = @constructor
    if clasz._rnd_int_cfg?
      seed      = clasz._rnd_int_cfg.seed   ? 12.34
      delta     = clasz._rnd_int_cfg.delta  ? 1
      @_rnd_int = CND.get_rnd_int seed, delta
    else
      @_rnd_int = CND.random_integer.bind CND
    return null

  #---------------------------------------------------------------------------------------------------------
  _get_connection_url: ( dbnick = null ) =>
    ### TAINT rename `dbnick` to `dbnick` ###
    ### Given an optional `dbnick`, return an object with the `dbnick` and the `url` for a new SQLite
    connection. The url will look like `'file:your_name_here?mode=memory&cache=shared` so multiple
    connections to the same RAM DB can be opened. When `dbnick` is not given, a random dbnick like
    `_icql_6200294332` will be chosen (prefix `_icql_`, suffix ten decimal digits). For testing, setting
    class property `@_rnd_int_cfg` can be used to obtain repeatable series of random names. ###
    dbnick ?= "_icql_#{@_rnd_int 1_000_000_000, 9_999_999_999}"
    url     = "file:#{dbnick}?mode=memory&cache=shared"
    return { url, dbnick, }


