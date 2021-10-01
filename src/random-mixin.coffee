
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'DBAY/MIXIN/RANDOM'
debug                     = CND.get_logger 'debug',     badge
#...........................................................................................................
guy                       = require 'guy'


#===========================================================================================================
@Dbay_random = ( clasz = Object ) => class extends clasz

  #=========================================================================================================
  # RANDOM NUMBER GENERATION
  # seedable for testing purposes
  #---------------------------------------------------------------------------------------------------------
  ### To obtain a class with a seedable PRNG that emits repeatable sequences, define class property
  `@_rnd_int_cfg: { seed, delta, }` where both seed and delta can be arbitrary finite numbers. **NOTE**
  very small `delta` values (like 1e-10) may cause adjacent numbers to be close together or even repeat. To
  use default values for both parameters, set `@_rnd_int_cfg: true`.###
  @_rnd_int_cfg: false
  _$random_initialize: ->
    clasz = @constructor
    if clasz._rnd_int_cfg?
      seed      = clasz._rnd_int_cfg?.seed  ? 12.34
      delta     = clasz._rnd_int_cfg?.delta ? 1
      guy.props.def @_me, '_rnd_int', { enumerable: false, value: ( CND.get_rnd_int seed, delta ), }
    else
      guy.props.def @_me, '_rnd_int', { enumerable: false, value: ( CND.random_integer.bind CND ), }
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



