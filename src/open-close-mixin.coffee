
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'DBAY/MIXIN/OPEN-CLOSE'
debug                     = CND.get_logger 'debug',     badge
#...........................................................................................................
guy                       = require 'guy'
E                         = require './errors'
SQL                       = String.raw


#===========================================================================================================
@Dbay_openclose = ( clasz = Object ) => class extends clasz

  #---------------------------------------------------------------------------------------------------------
  open: ( cfg ) ->
    cfg             = { cfg..., }
    # cfg.temporary  ?= if cfg.path? then false else true
    @constructor.cast_constructor_cfg @, cfg
    @types.validate.dbay_open_cfg cfg
    { path, schema, temporary, } = cfg
    @_attach schema, path, temporary
    return null

  #---------------------------------------------------------------------------------------------------------
  _attach: ( schema, path, temporary ) ->
    ### Execute SQL"attach $path as $schema". This will fail if
      * `schema` already exists, or
      * the maximum number of schemas (125) has already been attached, or
      * the schema name is `main` or `temp`.
    ###
    #.......................................................................................................
    try
      ( @sqlt1.prepare SQL"attach ? as ?;" ).run [ path, schema, ]
      ( @sqlt2.prepare SQL"attach ? as ?;" ).run [ path, schema, ]
    catch error
      throw error unless error.code is 'SQLITE_ERROR'
      throw new E.Dba_sqlite_too_many_dbs '^dba@313^', schema if error.message.startsWith 'too many attached databases'
      throw new E.Dba_sqlite_error        '^dba@314^', error
    @_register_schema schema, path, temporary
    return null


