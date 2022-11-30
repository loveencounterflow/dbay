
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
  whisper }               = GUY.trm.get_loggers 'DBAY/QUERY'
{ rpr
  inspect
  echo
  log     }               = GUY.trm
#...........................................................................................................
E                         = require './errors'


#===========================================================================================================
@DBay_query = ( clasz = Object ) => class extends clasz

  #---------------------------------------------------------------------------------------------------------
  _$query_initialize: ->
    GUY.props.def @_me, '_statements', { enumerable: false, value: {}, }
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _clear_statements_cache: ->
    delete @_statements[ k ] for k of @_statements
    return null

  #---------------------------------------------------------------------------------------------------------
  do: ( first, P... ) =>
    return switch ( type = @types.type_of first )
      when 'text'               then return @_query_run_or_execute first, P...
      when 'object', 'function' then return @with_transaction first, P...
      when 'statement'
        statement = first
        return if statement.reader then ( statement.iterate P... ) else ( statement.run P... )
    throw new E.DBay_wrong_type '^dbay/query@1^', 'a text, an object, or a function', type

  #---------------------------------------------------------------------------------------------------------
  _query_run_or_execute: ( sql, P... ) ->
    return @query   sql, P... if P.length > 0
    return @execute sql, P... if @_statements[ sql ] is @constructor.C.symbols.execute
    try
      statement = @prepare sql
    catch error
      throw error unless ( error.name is 'RangeError' ) \
        and ( error.message is "The supplied SQL string contains more than one statement" )
      @_statements[ sql ] = @constructor.C.symbols.execute
      return @execute sql, P...
    return if statement.reader then ( statement.iterate P... ) else ( statement.run P... )

  #---------------------------------------------------------------------------------------------------------
  query: ( sql, P... ) ->
    statement = if @types.isa.statement sql then sql else @prepare sql
    return if statement.reader then ( statement.iterate P... ) else ( statement.run P... )

  #---------------------------------------------------------------------------------------------------------
  walk: ( sql, P... ) ->
    statement = if @types.isa.statement sql then sql else @prepare sql
    return statement.iterate P...

  #---------------------------------------------------------------------------------------------------------
  all_rows: ( sql, P... ) ->
    statement = if @types.isa.statement sql then sql else @prepare sql
    return statement.all P...

  #---------------------------------------------------------------------------------------------------------
  as_object: ( key, sql, P... ) ->
    @types.validate.nonempty_text key
    R = {}
    for d from @query sql
      R[ d[ key ] ] = d
      delete d[ key ] ### TAINT should be optional ###
    return R

  #---------------------------------------------------------------------------------------------------------
  first_row: ( sql, P... ) -> ( @all_rows sql, P... )[ 0 ] ? null

  #---------------------------------------------------------------------------------------------------------
  first_values: ( sql, P... ) ->
    for row from @walk sql, P...
      for key, value of row
        yield value
        break
    return null

  #---------------------------------------------------------------------------------------------------------
  all_first_values: ( sql, P... ) -> [ ( @first_values sql, P... )..., ]

  #---------------------------------------------------------------------------------------------------------
  single_row: ( sql, P... ) ->
    unless ( rows = ( @all_rows sql, P... ) ).length is 1
      throw new E.DBay_expected_single_row '^dbay/query@2^', rows.length
    return rows[ 0 ]

  #---------------------------------------------------------------------------------------------------------
  single_value: ( sql, P... ) ->
    row = @single_row sql, P...
    unless ( keys = Object.keys row ).length is 1
      throw new E.DBay_expected_single_value '^dbay/query@4^', keys
    return row[ keys[ 0 ] ]

  #---------------------------------------------------------------------------------------------------------
  execute: ( sql, P... ) ->
    throw new E.DBay_argument_not_allowed '^dbay/query@5^', "extra", rpr P if P.length > 0
    @sqlt1.exec sql
    return null

  #---------------------------------------------------------------------------------------------------------
  execute_file: ( cfg ) ->
    @types.validate.dbay_execute_file_cfg ( cfg = { @constructor.C.defaults.dbay_execute_file_cfg..., cfg..., } )
    return @execute ( require 'fs' ).readFileSync cfg.path, { encoding: cfg.encoding, }

  #---------------------------------------------------------------------------------------------------------
  prepare: ( sql ) ->
    sql = @macros.resolve sql if @cfg.macros
    return ( @_statements[ sql ] ?= @sqlt1.prepare sql )

  #---------------------------------------------------------------------------------------------------------
  pragma: ( P...  ) ->
    @sqlt1.pragma P...

