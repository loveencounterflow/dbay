
'use strict'


############################################################################################################
GUY                       = require 'guy'
{ alert
  debug
  help
  info
  plain
  praise
  urge
  warn
  whisper }               = GUY.trm.get_loggers 'DBAY/HELPERS'
{ rpr
  inspect
  echo
  log     }               = GUY.trm
#...........................................................................................................
PATH                      = require 'path'
FS                        = require 'fs'
shm_path                  = '/dev/shm'
LFT                       = require 'letsfreezethat'


#-----------------------------------------------------------------------------------------------------------
@is_directory = ( path ) ->
  try
    return ( FS.statSync path ).isDirectory()
  catch error
    throw error unless error.code is 'ENOENT'
  return false

#-----------------------------------------------------------------------------------------------------------
@is_file = ( path ) ->
  try
    return ( FS.statSync path ).isFile()
  catch error
    throw error unless error.code is 'ENOENT'
  return false

#-----------------------------------------------------------------------------------------------------------
@unlink_file = ( path ) ->
  ### Given a `path`, unlink the associated file; in case no file is found, ignore silently. If an error
  occurs, just print a warning. To be used in an exit handler, so no error handling makes sense here. ###
  try FS.unlinkSync path catch error
    warn '^dbay@1^', error.message unless error.code is 'ENOENT'
  return null

#-----------------------------------------------------------------------------------------------------------
@autolocation = if @is_directory shm_path then shm_path else ( require 'os' ).tmpdir()

#-----------------------------------------------------------------------------------------------------------
@SQL = ( parts, expressions... ) ->
  R = parts[ 0 ]
  for expression, idx in expressions
    R += expression.toString() + parts[ idx + 1 ]
  return R

#-----------------------------------------------------------------------------------------------------------
@omit_nullish = ( d ) ->
  R       = {}
  R[ k ]  = v for k, v of d when v?
  return R

#-----------------------------------------------------------------------------------------------------------
@def  = def   = Object.defineProperty
@hide = hide  = ( object, name, value ) => Object.defineProperty object, name,
    enumerable:   false
    writable:     true
    configurable: true
    value:        value

#-----------------------------------------------------------------------------------------------------------
@_pick_with_fallback = ( d, fallback, keys... ) ->
  R     = {}
  keys  = keys.flat Infinity
  for key in keys
    R[ key ] = if ( value = d[ key ] ) is undefined then fallback else value
  return [ R, keys, ]

#-----------------------------------------------------------------------------------------------------------
@pick_with_fallback = ( d, fallback, keys... ) -> ( @_pick_with_fallback d, fallback, keys )[ 0 ]

#-----------------------------------------------------------------------------------------------------------
@pluck_with_fallback = ( d, fallback, keys... ) ->
  [ R, keys, ] = @_pick_with_fallback d, fallback, keys...
  delete d[ key ] for key in keys
  return R

#-----------------------------------------------------------------------------------------------------------
@def_oneoff = def_oneoff = ( object, name, cfg, method ) =>
  get = ->
    R = method.apply object
    delete cfg.get
    def object, name,
      configurable: ( cfg.configurable  ? true )
      enumerable:   ( cfg.enumerable    ? true )
      value:        R
    return R
  def object, name, { enumerable: true, configurable: true, get, }
  return null

#-----------------------------------------------------------------------------------------------------------
@configure_with_types = ( self, cfg = null, types = null ) =>
  { props, }    = require '..'
  clasz         = self.constructor
  #.........................................................................................................
  ### assign defaults object where to be found to obtain viable `cfg` object: ###
  defaults      = clasz.C?.defaults?.constructor_cfg ? null
  self.cfg      = { defaults..., cfg..., }
  #.........................................................................................................
  ### procure `types` where not given; make it a non-enumerable to avoid rpr of object: ###
  types        ?= new ( require 'intertype' ).Intertype()
  @def self, 'types', { enumerable: false, value: types, }
  #.........................................................................................................
  ### call class method `declare_types()`; this method may perform `self.types.validate.constructor_cfg self.cfg`: ###
  clasz.declare_types self if clasz.declare_types?
  self.cfg      = LFT.freeze self.cfg
  return undefined
