
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'DBAY/MIXIN/QUERY'
debug                     = CND.get_logger 'debug',     badge
#...........................................................................................................
guy                       = require 'guy'


#===========================================================================================================
@Dbay_query = ( clasz = Object ) => class extends clasz

  #---------------------------------------------------------------------------------------------------------
  constructor: ->
    super()
    guy.props.def @, '_statements', { enumerable: false, value: {}, }
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _clear_statements_cache: ->
    delete @_statements[ k ] for k of @_statements
    return null

  #---------------------------------------------------------------------------------------------------------
  query: ( sql, P... ) ->
    # @_echo 'query', sql
    statement = ( @_statements[ sql ] ?= @sqlt.prepare sql )
    returns_data  = statement.reader
    debug '^0048560^', returns_data
    # return statement.iterate P...

  # #---------------------------------------------------------------------------------------------------------
  # run: ( sql, P... ) ->
  #   @_echo 'run', sql
  #   statement = ( @_statements[ sql ] ?= @sqlt.prepare sql )
  #   return statement.run P...

  #---------------------------------------------------------------------------------------------------------
  execute: ( sql ) ->
    throw new E.Dba_argument_not_allowed '^dba@308^', "extra", rpr x if ( x = arguments[ 1 ] )?
    # @_echo 'execute', sql
    return @sqlt1.exec sql

  #---------------------------------------------------------------------------------------------------------
  prepare: ( sql  ) ->
    # @_echo 'prepare', sql
    return ( @_statements[ sql ] ?= @sqlt1.prepare sql )




