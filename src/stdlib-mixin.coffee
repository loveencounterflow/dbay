
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
E                         = require './errors'
#-----------------------------------------------------------------------------------------------------------
GUY                       = require 'guy'
### https://day.js.org ###
dayjs                     = require 'dayjs'
do =>
  utc               = require 'dayjs/plugin/utc';               dayjs.extend utc
  relativeTime      = require 'dayjs/plugin/relativeTime';      dayjs.extend relativeTime
  toObject          = require 'dayjs/plugin/toObject';          dayjs.extend toObject
  customParseFormat = require 'dayjs/plugin/customParseFormat'; dayjs.extend customParseFormat
  duration          = require 'dayjs/plugin/duration';          dayjs.extend duration


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
  constructor: ->
    super()
    GUY.props.hide @, '_dayjs', dayjs
    return undefined

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
      name:           prefix + 'sql_i'
      deterministic:  true
      varargs:        false
      call:           ( name ) => @sql.I name

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
    @create_function
      name:           prefix + 'str_is_blank'
      deterministic:  true
      varargs:        false
      call:           ( s ) -> if ( /^\s+$/ ).test s then 1 else 0

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
      name:           prefix + 're_matches'
      columns:        [ 'match', 'capture', ]
      parameters:     [ 'text', 'pattern', ]
      rows: ( text, pattern ) ->
        regex = new RegExp pattern, 'g'
        while ( match = regex.exec text )?
          yield [ match[ 0 ], ( match[ 1 ] ? null ), ]
        return null

    #-------------------------------------------------------------------------------------------------------
    @create_function
      name:           prefix + 're_is_match'
      deterministic:  false
      varargs:        false
      call:           ( text, pattern ) -> if ( new RegExp pattern, 'g' ).test text then 1 else 0


    #=======================================================================================================
    # ASSERTS AND EXCEPTIONS
    #-------------------------------------------------------------------------------------------------------
    @create_function
      name:           prefix + 'echo'
      deterministic:  false
      varargs:        false
      call:           ( message ) -> echo message; return message

    #-------------------------------------------------------------------------------------------------------
    @create_function
      name:           prefix + 'debug'
      deterministic:  false
      varargs:        false
      call:           ( message ) -> debug message; return message

    #-------------------------------------------------------------------------------------------------------
    @create_function
      name:           prefix + 'info'
      deterministic:  false
      varargs:        false
      call:           ( message ) -> info message; return message

    #-------------------------------------------------------------------------------------------------------
    @create_function
      name:           prefix + 'warn'
      deterministic:  false
      varargs:        false
      call:           ( message ) -> warn message; return message


    #=======================================================================================================
    # ASSERTS AND EXCEPTIONS
    #-------------------------------------------------------------------------------------------------------
    @create_function
      name:           prefix + 'raise'
      deterministic:  true
      varargs:        false
      call: ( message ) ->
        throw new Error message

    #-------------------------------------------------------------------------------------------------------
    @create_function
      name:           prefix + 'raise_json'
      deterministic:  true
      varargs:        false
      call: ( facets_json ) ->
        try facets = JSON.parse facets_json catch error
          throw new Error "not a valid argument for std_raise_json: #{rpr facets}"
        error = new Error facets.message ? "(no error message given)"
        for k, v of facets
          continue if k is 'message'
          error[ k ] = v
        throw error

    #-------------------------------------------------------------------------------------------------------
    @create_function
      name:           prefix + 'assert'
      deterministic:  true
      varargs:        false
      call:           ( test, message ) ->
        if ( not test? ) or ( test is 0 )
          throw new Error message
        return test

    #-------------------------------------------------------------------------------------------------------
    @create_function
      name:           prefix + 'warn_if'
      deterministic:  true
      varargs:        false
      call:           ( test, message ) -> warn message if ( test is 1 ); test

    #-------------------------------------------------------------------------------------------------------
    @create_function
      name:           prefix + 'warn_unless'
      deterministic:  true
      varargs:        false
      call:           ( test, message ) -> warn message if ( not test? ) or ( test is 0 ); test


    #=======================================================================================================
    # VARIABLES
    #-------------------------------------------------------------------------------------------------------
    @variables  = {}

    #-------------------------------------------------------------------------------------------------------
    @create_function
      name:           prefix + 'getv'
      deterministic:  false
      call:           @getv.bind @

    #-------------------------------------------------------------------------------------------------------
    @create_table_function
      name:           prefix + 'variables',
      deterministic:  false,
      columns:        [ 'name', 'value', ]
      parameters:     []
      rows:           ( ( name ) -> yield [ name, ( @getv name ), ] for name of @variables ).bind @

    #=======================================================================================================
    # DATETIME
    #-------------------------------------------------------------------------------------------------------
    @create_function
      ### Returns a DBay_timestamp representing the present point in time. ###
      name:           prefix + 'dt_now'
      deterministic:  false
      varargs:        false
      call:           => @dt_now()
    #-------------------------------------------------------------------------------------------------------
    @create_function
      ### Given a DBay_timestamp, returns an English human-readable text indicating the remoteness of that
      time relative to now, like 'four minutes ago' or 'in a week'. ###
      name:           prefix + 'dt_from_now'
      deterministic:  false
      varargs:        false
      call:           ( dbay_timestamp ) => @dt_from_now dbay_timestamp

    #-------------------------------------------------------------------------------------------------------
    return null


  #=========================================================================================================
  # VARIABLES (2)
  #---------------------------------------------------------------------------------------------------------
  setv: ( name, value ) -> @variables[ name ] = value

  #---------------------------------------------------------------------------------------------------------
  getv: ( name ) ->
    if ( R = @variables[ name ] ) is undefined
      throw new E.DBay_unknown_variable '^dbay/stdlib@1^', name
    return switch
      when R is true  then 1
      when R is false then 0
      else R

  #=========================================================================================================
  # DATETIME (2)
  #---------------------------------------------------------------------------------------------------------
  _dt_dbay_timestamp_input_template:  'YYYYMMDD-HHmmssZ'
  _dt_dbay_timestamp_output_template: 'YYYYMMDD-HHmmss[Z]'

  #---------------------------------------------------------------------------------------------------------
  dt_from_now: ( dbay_timestamp ) ->
    return ( @dt_parse dbay_timestamp ).fromNow()

  #---------------------------------------------------------------------------------------------------------
  dt_now: -> @_dayjs().utc().format @_dt_dbay_timestamp_output_template

  #---------------------------------------------------------------------------------------------------------
  dt_parse: ( dbay_timestamp ) ->
    @types.validate.dbay_dt_timestamp dbay_timestamp
    R = ( @_dayjs dbay_timestamp, @_dt_dbay_timestamp_input_template ).utc()
    throw new E.DBay_invalid_timestamp '^dbay/stdlib@1^', dbay_timestamp unless @types.isa.dbay_dt_valid_dayjs R
    return R
