
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
      columns:        [ 'part', ]
      parameters:     [ 'text', 'splitter', 'omit_empty', ]
      deterministic:  true
      varargs:        false
      rows:           ( text, splitter, omit_empty = false ) ->
        if omit_empty then  yield { part, } for part in text.split splitter when part.length > 0
        else                yield { part, } for part in text.split splitter
        return null

    #-------------------------------------------------------------------------------------------------------
    @create_table_function
      name:           prefix + 'str_split_re'
      columns:        [ 'part', ]
      parameters:     [ 'text', 'splitter', 'flags', 'omit_empty', ]
      deterministic:  false
      varargs:        true
      rows:           ( text, splitter, flags = null, omit_empty = false ) ->
        omit_empty = !!omit_empty
        if flags?     then  re = new RegExp splitter, flags
        else                re = new RegExp splitter
        debug '^3341^', { text, splitter, flags, omit_empty, re, result: text.split re}
        if omit_empty # then
          for part in text.split re when part.length > 0
            yield { part, }
        else                yield { part, } for part in text.split re
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
