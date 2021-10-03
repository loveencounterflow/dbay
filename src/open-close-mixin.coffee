
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'DBAY/MIXIN/OPEN-CLOSE'
debug                     = CND.get_logger 'debug',     badge
#...........................................................................................................
guy                       = require 'guy'
E                         = require './errors'


#===========================================================================================================
@Dbay_openclose = ( clasz = Object ) => class extends clasz

  #---------------------------------------------------------------------------------------------------------
  open: ( cfg ) ->
    cfg             = { cfg..., }
    cfg.temporary  ?= if cfg.path? then false else true
    @types.validate.dbay_open_cfg ( cfg = { @types.defaults.dbay_open_cfg..., cfg..., } )
    { path, schema, ram, }  = cfg
    #.......................................................................................................
    ### TAINT troublesome logic with `path` and `saveas` ###
    if path?
      saveas  = path
    else
      path    = '' ### TAINT or ':memory:' depending on `cfg.disk` ###
      saveas  = null
    #.......................................................................................................
    if ram then @_open_file_db_in_ram { path, schema, saveas, }
    else        @_attach              { path, schema, saveas, }
    #.......................................................................................................
    return null



