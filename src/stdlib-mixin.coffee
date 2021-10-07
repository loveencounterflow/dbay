
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'DBAY/MIXIN/STDLIB'
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
info                      = CND.get_logger 'info',      badge
urge                      = CND.get_logger 'urge',      badge
help                      = CND.get_logger 'help',      badge
whisper                   = CND.get_logger 'whisper',   badge
echo                      = CND.echo.bind CND
{ freeze
  lets }                  = require 'letsfreezethat'

#-----------------------------------------------------------------------------------------------------------
walk_split_parts = ( text, splitter, omit_empty ) ->
  parts = text.split splitter
  parts = ( part for part in parts when ( not omit_empty ) or ( part isnt '' ) )
  count = parts.length
  for part, idx in parts
    lnr = idx + 1
    rnr = count - idx
    yield { lnr, rnr, part, }
  return null

#-----------------------------------------------------------------------------------------------------------
@DBay_stdlib = ( clasz = Object ) => class extends clasz
  ### TAINT use `cfg` ###

  #---------------------------------------------------------------------------------------------------------
  _$stdlib_initialize: ->
    @_stdlib_created = false
    return null

  #---------------------------------------------------------------------------------------------------------
  create_stdlib: ->
    return null if @_stdlib_created
    @_stdlib_created = true
    prefix = 'std_'

    #-------------------------------------------------------------------------------------------------------
    @create_function
      name:           prefix + 'str_reverse'
      deterministic:  true
      varargs:        false
      call:           ( s ) -> ( Array.from s ).reverse().join ''

    #-------------------------------------------------------------------------------------------------------
    @create_function
      name:           prefix + 'str_join'
      deterministic:  true
      varargs:        true
      call:           ( joiner, P... ) -> P.join joiner

    #-------------------------------------------------------------------------------------------------------
    @create_table_function
      name:           prefix + 'str_split'
      columns:        [ 'lnr', 'rnr', 'part', ]
      parameters:     [ 'text', 'splitter', 'omit_empty', ]
      deterministic:  true
      varargs:        false
      rows:           ( text, splitter, omit_empty = false ) ->
        omit_empty = !!omit_empty
        yield from walk_split_parts text, splitter, omit_empty
        return null

    #-------------------------------------------------------------------------------------------------------
    @create_table_function
      name:           prefix + 'str_split_re'
      columns:        [ 'lnr', 'rnr', 'part', ]
      parameters:     [ 'text', 'splitter', 'flags', 'omit_empty', ]
      deterministic:  false
      varargs:        true
      rows:           ( text, splitter, flags = null, omit_empty = false ) ->
        omit_empty = !!omit_empty
        if flags?     then  re = new RegExp splitter, flags
        else                re = new RegExp splitter
        yield from walk_split_parts text, re, omit_empty
        return null

    #-------------------------------------------------------------------------------------------------------
    @create_table_function
      name:           prefix + 'str_split_first'
      columns:        [ 'prefix', 'suffix', ]
      parameters:     [ 'text', 'splitter', ]
      deterministic:  true
      varargs:        false
      rows:           ( text, splitter ) ->
        return null if ( text is null ) or ( splitter is null )
        if ( idx = text.indexOf splitter ) < 0 then yield [ text, null, ]
        else                                        yield [ text[ ... idx ], text[ idx + 1 .. ], ]
        return null

    #-------------------------------------------------------------------------------------------------------
    @create_table_function
      name:           prefix + 'generate_series'
      columns:        [ 'value', ]
      parameters:     [ 'start', 'stop', 'step', ]
      varargs:        true
      deterministic:  true
      rows: ( start, stop = Infinity, step = 1 ) ->
        ### NOTE: `stop` differs from SQLite3, which has 9223372036854775807 ###
        value = start
        loop
          break if value > stop
          yield [ value, ]
          value += step
        return null

    #-------------------------------------------------------------------------------------------------------
    @create_table_function
      name:         prefix + 're_matches'
      columns:      [ 'match', 'capture', ]
      parameters:   [ 'text', 'pattern', ]
      rows: ( text, pattern ) ->
        regex = new RegExp pattern, 'g'
        while ( match = regex.exec text )?
          yield [ match[ 0 ], ( match[ 1 ] ? null ), ]
        return null

    #-------------------------------------------------------------------------------------------------------
    return null
