

'use strict'

############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'ICQL/MAIN'
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
info                      = CND.get_logger 'info',      badge
urge                      = CND.get_logger 'urge',      badge
help                      = CND.get_logger 'help',      badge
whisper                   = CND.get_logger 'whisper',   badge
echo                      = CND.echo.bind CND
#...........................................................................................................
# PATH                      = require 'path'
# PD                        = require 'pipedreams'
# { $
#   $async
#   select }                = PD
{ assign
  jr }                    = CND
# #...........................................................................................................
# join_path                 = ( P... ) -> PATH.resolve PATH.join P...
# boolean_as_int            = ( x ) -> if x then 1 else 0
{ inspect, }              = require 'util'
xrpr                      = ( x ) -> inspect x, { colors: yes, breakLength: Infinity, maxArrayLength: Infinity, depth: Infinity, }
#...........................................................................................................
IC                        = require 'intercourse'


#===========================================================================================================
# LOCAL METHODS
#-----------------------------------------------------------------------------------------------------------
local_methods =

  #---------------------------------------------------------------------------------------------------------
  limit: ( me, n, iterator ) ->
    count = 0
    for x from iterator
      return if count >= n
      count += +1
      yield x
    return

  #---------------------------------------------------------------------------------------------------------
  single_row:   ( me, iterator ) ->
    throw new Error "µ33833 expected at least one row, got none" if ( R = @first_row iterator ) is undefined
    return R

  #---------------------------------------------------------------------------------------------------------
  all_first_values: ( me, iterator ) ->
    R = []
    for row from iterator
      for key, value of row
        R.push value
        break
    return R

  #---------------------------------------------------------------------------------------------------------
  first_values: ( me, iterator ) ->
    R = []
    for row from iterator
      for key, value of row
        yield value
    return R

  #---------------------------------------------------------------------------------------------------------
  first_row:    ( me, iterator  ) -> return row for row from iterator
  ### TAINT must ensure order of keys in row is same as order of fields in query ###
  single_value: ( me, iterator  ) -> return value for key, value of @single_row iterator
  first_value:  ( me, iterator  ) -> return value for key, value of @first_row iterator
  all_rows:     ( me, iterator  ) -> [ iterator..., ]

  #---------------------------------------------------------------------------------------------------------
  query: ( me, sql, P... ) ->
    statement = @prepare sql
    return statement.iterate P...

  #---------------------------------------------------------------------------------------------------------
  prepare:        ( me, P...  ) -> me.$.db.prepare          P...
  aggregate:      ( me, P...  ) -> me.$.db.aggregate        P...
  backup:         ( me, P...  ) -> me.$.db.backup           P...
  checkpoint:     ( me, P...  ) -> me.$.db.checkpoint       P...
  close:          ( me, P...  ) -> me.$.db.close            P...
  execute:        ( me, P...  ) -> me.$.db.exec             P...
  function:       ( me, P...  ) -> me.$.db.function         P...
  load:           ( me, P...  ) -> me.$.db.loadExtension    P...
  pragma:         ( me, P...  ) -> me.$.db.pragma           P...
  transaction:    ( me, P...  ) -> me.$.db.transaction      P...
  #.........................................................................................................
  as_identifier:  ( me, text  ) -> '"' + ( text.replace /"/g, '""' ) + '"'
  ### TAINT kludge: we sort by descending types so views, tables come before indexes (b/c you can't drop a
  primary key index in SQLite) ###
  catalog:        ( me        ) -> @query "select * from sqlite_master order by type desc, name;"

  #---------------------------------------------------------------------------------------------------------
  clear: ( me ) ->
    count = 0
    for { type, name, } in @all_rows @catalog()
      statement = "drop #{type} if exists #{@as_identifier name};"
      me.$.execute statement
      count += +1
    return count

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@bind = ( settings ) ->
  throw new Error "µ94721 need settings.connector"  unless settings.connector?
  throw new Error "µ94721 need settings.db_path"    unless settings.db_path?
  throw new Error "µ94721 need settings.icql_path"  unless settings.icql_path?
  me            = { $: {}, }
  # me.$.settings = assign {}, settings
  @connect                    me, settings.connector, settings.db_path, settings.db_settings
  @definitions_from_path_sync me, settings.icql_path
  @bind_definitions           me
  return me

#-----------------------------------------------------------------------------------------------------------
### TAINT should check connector API compatibility ###
### TAINT consider to use `new`-less call convention (should be possible acc. to bsql3 docs) ###
@connect = ( me, connector, db_path, db_settings = {} ) ->
  ( me.$ ?= {} ).db  = new connector db_path, db_settings
  return me

#-----------------------------------------------------------------------------------------------------------
@definitions_from_path_sync = ( me, icql_path ) ->
  ( me.$ ?= {} ).sql = IC.definitions_from_path_sync icql_path
  return me

#-----------------------------------------------------------------------------------------------------------
@bind_definitions = ( me ) ->
  check_unique = ( name ) ->
    throw new Error "µ11292 name collision: #{rpr name} already defined" if me[ name ]?
  me.$ ?= {}
  #.........................................................................................................
  for name, local_method of local_methods
    do ( name, local_method ) ->
      check_unique name
      local_method  = local_method.bind me.$
      method        = ( P... ) ->
        try
          local_method me, P...
        catch error
          warn "when trying to call method #{name} with #{xrpr P}"
          warn "an error occurred: #{error.message}"
          throw error
      me.$[ name ]  = method.bind me.$
  #.........................................................................................................
  for name, ic_entry of me.$.sql
    ### TAINT fix in intercourse ###
    ic_entry.name = name
    check_unique name
    me[ name ] = @_method_from_ic_entry me, ic_entry
  #.........................................................................................................
  return me

#-----------------------------------------------------------------------------------------------------------
@_method_from_ic_entry = ( me, ic_entry ) ->
  endpoint = switch ic_entry.type
    when 'procedure'  then me.$.execute
    when 'query'      then me.$.query
    else throw new Error "µ11109 unknown icSQL type #{rpr ic_entry.type}"
  return ( Q ) =>
    descriptor = @_descriptor_from_arguments me, ic_entry, Q
    return endpoint descriptor.text, Q if Q?
    return endpoint descriptor.text

#-----------------------------------------------------------------------------------------------------------
@_descriptor_from_arguments = ( me, ic_entry, Q ) ->
  [ signature, kenning, ]         = IC.get_signature_and_kenning Q
  is_void_signature               = kenning in [ '()', 'null', ]
  if is_void_signature  then  R   = ic_entry[ '()'    ] ? ic_entry[ 'null' ]
  else                        R   = ic_entry[ kenning ]
  R                              ?= ic_entry[ 'null'  ]
  #.........................................................................................................
  unless R?
    throw new Error "µ93832 calling method #{rpr ic_entry.name} with signature #{kenning} not implemented"
  return R



