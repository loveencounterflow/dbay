
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
  whisper }               = GUY.trm.get_loggers 'DBAY/RANDOM'
{ rpr
  inspect
  echo
  log     }               = GUY.trm
#...........................................................................................................
guy                       = require 'guy'
types                     = new ( require 'intertype' ).Intertype()


#===========================================================================================================
types.declare 'constructor_cfg', tests:
  "@isa.object x":                ( x ) -> @isa.object x
  "x.seed may be a float within certain boundaries": ( x ) ->
    return true  unless x.seed?
    return false unless @isa.float x.seed
    return -1e10 < x.seed < +1e10
  "x.delta may be a float within certain boundaries": ( x ) ->
    return true  unless x.delta?
    return false unless @isa.float x.delta
    return false unless ( Math.abs x.delta ) > 1e-3
    return -1e10 < x.delta < +1e10


#===========================================================================================================
# RANDOM NUMBER GENERATION
# seedable for testing purposes
#-----------------------------------------------------------------------------------------------------------
class @Random

  #---------------------------------------------------------------------------------------------------------
  @C: guy.lft.freeze
    defaults:
      #.....................................................................................................
      constructor_cfg:
        seed:         null
        delta:        null

  #=========================================================================================================
  constructor: ( cfg ) ->
    @cfg = guy.lft.freeze { @constructor.C.defaults.constructor_cfg..., cfg..., }
    types.validate.constructor_cfg @cfg
    if @cfg.seed? or @cfg.delta?
      seed                = @cfg.seed  ? 12.34
      delta               = @cfg.delta ? 1
      @get_random_integer = GUY.rnd.get_rnd_int seed, delta
    else
      @get_random_integer = GUY.rnd.random_integer.bind GUY.rnd
    return undefined

  #---------------------------------------------------------------------------------------------------------
  get_random_filename: ( extension = 'sqlite' ) ->
    n10 = @get_random_integer 1_000_000_000, 9_999_999_999
    return "dbay-#{n10}.#{extension}"



