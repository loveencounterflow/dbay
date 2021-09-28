
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
shm_path                  = '/dev/shm'
guy                       = require 'guy'

#-----------------------------------------------------------------------------------------------------------
@is_directory = ( path ) ->
  try
    return ( FS.statSync path ).isDirectory()
  catch error
    throw error unless error.code is 'ENOENT'
  return false

#-----------------------------------------------------------------------------------------------------------
@autolocation = if @is_directory shm_path then shm_path else ( require 'os' ).tmpdir()

#===========================================================================================================
class @Dbay_rnd

  #=========================================================================================================
  # RANDOM NUMBER GENERATION
  # seedable for testing purposes
  #---------------------------------------------------------------------------------------------------------
  ### To obtain a class with a seedable PRNG that emits repeatable sequences, define class property
  `@_rnd_int_cfg: { seed, delta, }` where both seed and delta can be arbitrary finite numbers. **NOTE**
  very small `delta` values (like 1e-10) may cause adjacent numbers to be close together or even repeat. To
  use default values for both parameters, set `@_rnd_int_cfg: true`.###
  @_rnd_int_cfg: false
  _initialize_prng: ->
    clasz = @constructor
    if clasz._rnd_int_cfg?
      seed      = clasz._rnd_int_cfg?.seed  ? 12.34
      delta     = clasz._rnd_int_cfg?.delta ? 1
      guy.props.def @, '_rnd_int', { enumerable: false, value: ( CND.get_rnd_int seed, delta ), }
    else
      guy.props.def @, '_rnd_int', { enumerable: false, value: ( CND.random_integer.bind CND ), }
    return null

  #---------------------------------------------------------------------------------------------------------
  _get_random_filename: ->
    ### TAINT rename `dbnick` to `dbnick` ###
    ### Given an optional `dbnick`, return an object with the `dbnick` and the `url` for a new SQLite
    connection. The url will look like `'file:your_name_here?mode=memory&cache=shared` so multiple
    connections to the same RAM DB can be opened. When `dbnick` is not given, a random dbnick like
    `_icql_6200294332` will be chosen (prefix `_icql_`, suffix ten decimal digits). For testing, setting
    class property `@_rnd_int_cfg` can be used to obtain repeatable series of random names. ###
    n10     = @_rnd_int 1_000_000_000, 9_999_999_999
    return "dbay-#{n10}.sqlite"

  #---------------------------------------------------------------------------------------------------------
  constructor: -> @_initialize_prng()


