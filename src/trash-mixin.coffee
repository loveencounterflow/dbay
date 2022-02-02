
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'DBAY/MIXIN/TRASH'
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
info                      = CND.get_logger 'info',      badge
urge                      = CND.get_logger 'urge',      badge
help                      = CND.get_logger 'help',      badge
whisper                   = CND.get_logger 'whisper',   badge
echo                      = CND.echo.bind CND
{ freeze
  lets }                  = require 'letsfreezethat'
E                         = require './errors'


#-----------------------------------------------------------------------------------------------------------
@DBay_trash = ( clasz = Object ) => class extends clasz

  #---------------------------------------------------------------------------------------------------------
  _$trash_initialize: ->
    @_trash_created = false
    return null


