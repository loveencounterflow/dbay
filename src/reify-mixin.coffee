
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'DBAY/MIXIN/REIFY'
debug                     = CND.get_logger 'debug',     badge
#...........................................................................................................
guy                       = require 'guy'
E                         = require './errors'
SQL                       = String.raw


#===========================================================================================================
@DBay_reify = ( clasz = Object ) => class extends clasz

  # #---------------------------------------------------------------------------------------------------------
  # _$reify_initialize: ->
  #   guy.props.def @_me, '_statements', { enumerable: false, value: {}, }
  #   return undefined


  #---------------------------------------------------------------------------------------------------------
  _rf_get_primary_keys: ( cfg ) ->
    { schema  } = @cfg
    R = @all_rows SQL"""
      select 
          -- pk                          as nr,
          $table                      as "table",
          name                        as field, 
          lower( type )               as type,
          not "notnull"               as nullable
        from #{schema}.pragma_table_info( $table )
        where true 
          and ( pk > 0 )
        order by pk;""", cfg
    row.nullable = not not row.nullable for row in R
    return R

  #---------------------------------------------------------------------------------------------------------
  _rf_get_foreign_keys: ( cfg ) ->
    { schema  } = @cfg
    R = @all_rows SQL"""
      select 
          $table                      as from_table,
          "from"                      as from_field,
          "table"                     as to_table,
          coalesce( "to", "from" )    as to_field
        from #{schema}.pragma_foreign_key_list( $table )
        order by seq;""", cfg
    return R

  #---------------------------------------------------------------------------------------------------------
  _rf_get_foreign_key_by_from_fields: ( cfg ) ->
    { schema  } = @cfg
    R = {}
    for row from @query SQL"""
      select 
          "from"                      as from_field,
          "table"                     as to_table,
          coalesce( "to", "from" )    as to_field
        from #{schema}.pragma_foreign_key_list( $table );""", cfg
      R[ row.from_field ] = { table: row.to_table, field: row.to_field, }
    return R

  #---------------------------------------------------------------------------------------------------------
  _get_primary_key_clause: ( cfg ) ->
    { I     } = @sql
    pks       = @_rf_get_primary_keys cfg 
    pk_names  = ( I pk.field for pk in pks ).join ', '
    return SQL"primary key ( #{pk_names} )"

  #---------------------------------------------------------------------------------------------------------
  _get_foreign_key_clauses: ( cfg ) ->
    { I     } = @sql
    R         = {}
    for from_field, { table, field, } of @_rf_get_foreign_key_by_from_fields cfg 
      R[ from_field ] = "references #{I table} ( #{I field} )"
    return R
