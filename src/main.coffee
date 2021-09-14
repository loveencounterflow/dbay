
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

types.declare 'dba_urlsafe_word', tests:
  "@isa.nonempty_text x":                 ( x ) -> @isa.nonempty_text x
  "/^[a-zA-Z0-9_]+$/.test x":             ( x ) -> /^[a-zA-Z0-9_]+$/.test x
types.declare 'constructor_cfg', tests:
  "@isa.object x":                            ( x ) -> @isa.object x
  "@isa_optional.boolean x.ram":              ( x ) -> @isa_optional.boolean x.ram
  "@isa_optional.nonempty_text x.url":        ( x ) -> @isa_optional.nonempty_text x.url
  "@isa_optional.dba_urlsafe_word x.dbnick":  ( x ) -> @isa_optional.dba_urlsafe_word x.dbnick
  "@isa_optional.dba_urlsafe_word x.dbnick":  ( x ) -> @isa_optional.dba_urlsafe_word x.dbnick

class @Dbay

  #---------------------------------------------------------------------------------------------------------
  @C: guy.lft.freeze
    defaults:
      constructor_cfg:
        _temp_prefix: '_dba_temp_'
        readonly:     false
        create:       true
        overwrite:    false
        timeout:      5000
        #...................................................................................................
        ram:        false
        path:       null
        dbnick:     null

  #---------------------------------------------------------------------------------------------------------
  @cast_constructor_cfg: ( self ) ->
    if ( self.cfg.ram is false ) and ( not self.cfg.path? )
      throw new E.Dba_cfg_error '^dba@1^', "missing argument `path`, got #{rpr self.cfg}"
    self.cfg.ram ?= not self.cfg.path?
    if ( not self.cfg.ram ) and self.cfg.path? and self.cfg.dbnick?
      throw new E.Dba_cfg_error '^dba@1^', "only RAM DB can have both `path` and `dbnick`, got #{rpr self.cfg}"
    if self.cfg.ram
      { dbnick
        url    }        = _xxx_dba._get_connection_url self.cfg.dbnick ? null
      self.cfg.dbnick  ?= dbnick
      self.cfg.url      = url
    else
      self.cfg.url      = null
    return self.cfg

  #---------------------------------------------------------------------------------------------------------
  @declare_types: ( self ) ->
    # debug '^133^', self.cfg, Object.isFrozen self.cfg
    self.cfg = @cast_constructor_cfg self
    self.types.validate.constructor_cfg self.cfg
    # guy.props.def self, 'dba', { enumerable: false, value: self.cfg.dba, }
    return null

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    # super()
    guy.cfg.configure_with_types @, cfg, types
    # @_compile_sql()
    # @_create_sql_functions()
    # @_create_db_structure()
    return undefined


