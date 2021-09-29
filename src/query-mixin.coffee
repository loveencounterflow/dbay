
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'DBAY/MIXIN/QUERY'
debug                     = CND.get_logger 'debug',     badge
#...........................................................................................................
guy                       = require 'guy'
E                         = require './errors'


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
    statement = ( @_statements[ sql ] ?= @sqlt1.prepare sql )
    return if statement.reader then ( statement.iterate P... ) else ( statement.run P... )

  #---------------------------------------------------------------------------------------------------------
  execute: ( sql, P... ) ->
    throw new E.Dbay_argument_not_allowed '^dba@308^', "extra", rpr P if P.length > 0
    # @_echo 'execute', sql
    @sqlt1.exec sql
    return null

  #---------------------------------------------------------------------------------------------------------
  prepare: ( sql  ) ->
    # @_echo 'prepare', sql
    return ( @_statements[ sql ] ?= @sqlt1.prepare sql )




