

'use strict'

############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'ICQL/DBA'
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
info                      = CND.get_logger 'info',      badge
urge                      = CND.get_logger 'urge',      badge
help                      = CND.get_logger 'help',      badge
whisper                   = CND.get_logger 'whisper',   badge
echo                      = CND.echo.bind CND
#...........................................................................................................
FS                        = require 'fs'
HOLLERITH                 = require 'hollerith-codec'
#...........................................................................................................
types                     = require './types'
{ isa
  validate
  validate_optional
  declare
  size_of
  type_of }               = types
{ freeze
  lets }                  = require 'letsfreezethat'
L                         = @
{ misfit }                = require './common'
E                         = require './errors'
new_bsqlt3_connection     = require 'better-sqlite3'
PATH                      = require 'path'
TMP                       = require 'tempy'
{ Import_export_mixin }   = require './import-export-mixin'
def                       = Object.defineProperty
def_oneoff                = ( object, name, method ) ->
  def object, name,
    enumerable:   true
    configurable: true
    get: ->
      R = method()
      def object, name, enumerable: false, configurable: false, value: R
      return R




#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
class @Dba extends Import_export_mixin()

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    super()
    def @, 'types',       { enumerable: false, value: types, }
    def @, '_statements', { enumerable: false, value: {}, }
    def @, 'sql',         { enumerable: false, value: ( new ( require './sql' ).Sql() ), }
    @_schemas     = freeze {}
    @cfg          = freeze { @types.defaults.dba_constructor_cfg..., cfg..., }
    validate.dba_constructor_cfg @cfg
    @_dbg         = { debug: @cfg.debug, echo: @cfg.echo, }
    @_formats     = freeze { @types.defaults.extensions_and_formats..., }
    throw new E.Dba_cfg_error '^dba@300^', "property `sqlt` not supported"   if @cfg.sqlt?
    throw new E.Dba_cfg_error '^dba@301^', "property `schema` not supported" if @cfg.schema?
    throw new E.Dba_cfg_error '^dba@302^', "property `path` not supported"   if @cfg.path?
    @_bsqlt3_cfg  = freeze {
      readonly:       @cfg.readonly
      fileMustExist:  not @cfg.create
      timeout:        @cfg.timeout }
      # verbose:        ### TAINT to be done ###
    @_initialized = false
    #.......................................................................................................
    def_oneoff @, 'sqlt', =>
      @_initialized = true
      return new_bsqlt3_connection '', @_bsqlt3_cfg
    #.......................................................................................................
    return undefined

  #---------------------------------------------------------------------------------------------------------
  open: ( cfg ) ->
    validate.dba_open_cfg ( cfg = { @types.defaults.dba_open_cfg..., cfg..., } )
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

  #---------------------------------------------------------------------------------------------------------
  save: ( cfg ) ->
    ### TAINT could implement prohibition of `path` in type `dba_save_cfg` ###
    validate.dba_save_cfg ( cfg = { @types.defaults.dba_export_cfg..., cfg..., } )
    { schema
      path }    = cfg
    throw new E.Dba_argument_not_allowed '^dba@303^', 'path', path if path?
    path        = @_schemas[ schema ]?.path ? null
    throw new E.Dba_schema_unknown '^dba@304^', schema unless path?
    return @export { schema, path, format: 'sqlite', }

  #---------------------------------------------------------------------------------------------------------
  export: ( cfg ) ->
    ### TAINT add boolean `cfg.overwrite` ###
    validate.dba_export_cfg ( cfg = { @types.defaults.dba_export_cfg..., cfg..., } )
    { schema
      path
      format }  = cfg
    format     ?= @_format_from_path path
    throw new E.Dba_extension_unknown '^dba@305^', path unless format?
    switch format
      when 'sqlite' then @_vacuum_atomically { schema, path, }
      ### TAINT when format derived from path, may be undefined, making the error message unintelligible ###
      else throw new E.Dba_format_unknown '^dba@306^', format
    return null

  #---------------------------------------------------------------------------------------------------------
  _vacuum_atomically: ( cfg ) ->
    validate.dba_vacuum_atomically ( cfg = { @types.defaults.dba_vacuum_atomically..., cfg..., } )
    { schema
      path }  = cfg
    schema_i  = @sql.I schema
    try
      tmpdir_path   = TMP.directory { prefix: @cfg._temp_prefix, }
      tmpfile_path  = PATH.join tmpdir_path, PATH.basename path
      @run "vacuum #{schema_i} into ?;", [ tmpfile_path, ]
      FS.renameSync tmpfile_path, path
    finally
      FS.rmdirSync tmpdir_path
    return null

  #---------------------------------------------------------------------------------------------------------
  is_ram_db: ( cfg ) ->
    validate.dba_is_ram_db_cfg ( cfg = { @types.defaults.dba_is_ram_db_cfg..., cfg..., } )
    { schema } = cfg
    sql = "select file from pragma_database_list where name = ? limit 1;"
    try
      return @types.isa.dba_ram_path @single_value @query sql, [ schema, ]
    catch error
      throw new E.Dba_schema_unknown '^dba@307^', schema if error instanceof E.Dba_expected_one_row
      throw error

  #---------------------------------------------------------------------------------------------------------
  _list_temp_schema_numbers: ->
    matcher = @cfg._temp_prefix + '%'
    sql     = """
      select
          cast( substring( name, ? ) as integer ) as n
        from pragma_database_list
        where name like ?;"""
    return @all_first_values @query sql, [ @cfg._temp_prefix.length + 1, matcher, ]

  #---------------------------------------------------------------------------------------------------------
  _max_temp_schema_number: ->
    matcher = @cfg._temp_prefix + '%'
    sql     = """
      select
          max( cast( substring( name, ? ) as integer ) ) as n
        from pragma_database_list
        where name like ?;"""
    return ( @first_value @query sql, [ @cfg._temp_prefix.length + 1, matcher, ] ) ? 0

  #---------------------------------------------------------------------------------------------------------
  _get_free_temp_schema: -> @cfg._temp_prefix + "#{( @_max_temp_schema_number() + 1 )}"


  #=========================================================================================================
  # DEBUGGING
  #---------------------------------------------------------------------------------------------------------
  _echo: ( ref, sql ) ->
    return null unless @_dbg.echo
    echo ( CND.reverse CND.blue "^icql@888-#{ref}^" ) + ( CND.reverse CND.yellow sql )
    return null

  #---------------------------------------------------------------------------------------------------------
  _debug: ( P... ) ->
    return null unless @_dbg.debug
    debug P...
    return null


  #=========================================================================================================
  # QUERY RESULT ADAPTERS
  #---------------------------------------------------------------------------------------------------------
  limit: ( n, iterator ) ->
    count = 0
    for x from iterator
      return if count >= n
      count += +1
      yield x
    return

  #---------------------------------------------------------------------------------------------------------
  single_row:   ( iterator ) ->
    throw new E.Dba_expected_one_row 'dba@763^', 0 if ( R = @first_row iterator ) is undefined
    return R

  #---------------------------------------------------------------------------------------------------------
  all_first_values: ( iterator ) ->
    R = []
    for row from iterator
      for key, value of row
        R.push value
        break
    return R

  #---------------------------------------------------------------------------------------------------------
  first_values: ( iterator ) ->
    R = []
    for row from iterator
      for key, value of row
        yield value
    return R

  #---------------------------------------------------------------------------------------------------------
  first_row:    ( iterator  ) -> return row for row from iterator
  ### TAINT must ensure order of keys in row is same as order of fields in query ###
  single_value: ( iterator  ) -> return value for key, value of @single_row iterator
  first_value:  ( iterator  ) -> return value for key, value of @first_row iterator
  list:         ( iterator  ) -> [ iterator..., ]


  #=========================================================================================================
  # QUERYING
  #---------------------------------------------------------------------------------------------------------
  query: ( sql, P... ) ->
    @_echo 'query', sql
    statement = ( @_statements[ sql ] ?= @sqlt.prepare sql )
    return statement.iterate P...

  #---------------------------------------------------------------------------------------------------------
  run: ( sql, P... ) ->
    @_echo 'run', sql
    statement = ( @_statements[ sql ] ?= @sqlt.prepare sql )
    return statement.run P...

  #---------------------------------------------------------------------------------------------------------
  _run_or_query: ( entry_type, is_last, sql, Q ) ->
    @_echo '_run_or_query', sql
    statement     = ( @_statements[ sql ] ?= @sqlt.prepare sql )
    returns_data  = statement.reader
    #.......................................................................................................
    ### Always use `run()` method if statement does not return data: ###
    unless returns_data
      return if Q? then ( statement.run Q ) else statement.run()
    #.......................................................................................................
    ### If statement does return data, consume iterator unless this is the last statement: ###
    if ( entry_type is 'procedure' ) or ( not is_last )
      return if Q? then ( statement.all Q ) else statement.all()
    #.......................................................................................................
    ### Return iterator: ###
    return if Q? then ( statement.iterate Q ) else statement.iterate()

  #---------------------------------------------------------------------------------------------------------
  execute: ( sql ) ->
    throw new E.Dba_argument_not_allowed '^dba@308^', "extra", rpr x if ( x = arguments[ 1 ] )?
    @_echo 'execute', sql
    return @sqlt.exec sql

  #---------------------------------------------------------------------------------------------------------
  prepare: ( sql  ) ->
    @_echo 'prepare', sql
    return @sqlt.prepare sql


  #=========================================================================================================
  # OTHER
  #---------------------------------------------------------------------------------------------------------
  backup:         ( P...  ) -> @sqlt.backup           P...
  checkpoint:     ( P...  ) -> @sqlt.checkpoint       P...
  close:          ( P...  ) -> @sqlt.close            P...
  read:           ( path  ) -> @sqlt.exec FS.readFileSync path, { encoding: 'utf-8', }
  load_extension: ( P...  ) -> @sqlt.loadExtension    P...
  pragma:         ( P...  ) -> @sqlt.pragma           P...
  transaction:    ( P...  ) -> @sqlt.transaction      P...

  #---------------------------------------------------------------------------------------------------------
  _get_foreign_key_state: -> not not ( @pragma "foreign_keys;" )[ 0 ].foreign_keys

  #---------------------------------------------------------------------------------------------------------
  _set_foreign_key_state: ( onoff ) ->
    validate.boolean onoff
    @pragma "foreign_keys = #{onoff};"
    return null

  #---------------------------------------------------------------------------------------------------------
  do_unsafe:        ( f ) -> @sqlt.unsafeMode true; try return       f() finally @sqlt.unsafeMode false
  do_unsafe_async:  ( f ) -> @sqlt.unsafeMode true; try return await f() finally @sqlt.unsafeMode false


  #=========================================================================================================
  # USER-DEFINED FUNCTIONS
  #---------------------------------------------------------------------------------------------------------
  create_function: ( cfg ) ->
    validate.dba_create_function_cfg ( cfg = { @types.defaults.dba_create_function_cfg..., cfg..., } )
    { name
      call
      directOnly
      deterministic
      varargs }     = cfg
    return @sqlt.function name, { deterministic, varargs, directOnly, }, call

  #---------------------------------------------------------------------------------------------------------
  create_aggregate_function: ( cfg ) ->
    validate.dba_create_aggregate_function_cfg ( cfg = { @types.defaults.dba_create_aggregate_function_cfg..., cfg..., } )
    { name
      start
      step
      directOnly
      deterministic
      varargs }     = cfg
    return @sqlt.aggregate name, { start, step, deterministic, varargs, directOnly, }

  #---------------------------------------------------------------------------------------------------------
  create_window_function: ( cfg ) ->
    validate.dba_create_window_function_cfg ( cfg = { @types.defaults.dba_create_window_function_cfg..., cfg..., } )
    { name
      start
      step
      inverse
      result
      directOnly
      deterministic
      varargs }     = cfg
    return @sqlt.aggregate name, { start, step, inverse, result, deterministic, varargs, directOnly, }

  #---------------------------------------------------------------------------------------------------------
  create_table_function: ( cfg ) ->
    validate.dba_create_table_function_cfg ( cfg = { @types.defaults.dba_create_table_function_cfg..., cfg..., } )
    { name
      parameters
      columns
      rows
      directOnly
      deterministic
      varargs }     = cfg
    return @sqlt.table name, { parameters, columns, rows, deterministic, varargs, directOnly, }

  #---------------------------------------------------------------------------------------------------------
  create_virtual_table: ( cfg ) ->
    validate.dba_create_virtual_table_cfg ( cfg = { @types.defaults.dba_create_virtual_table_cfg..., cfg..., } )
    { name, create, } = cfg
    return @sqlt.table name, create


  #=========================================================================================================
  # DB STRUCTURE REPORTING
  #---------------------------------------------------------------------------------------------------------
  catalog: ->
    ### TAINT kludge: we sort by descending types so views, tables come before indexes (b/c you can't drop a
    primary key index in SQLite) ###
    throw new E.Dba_not_implemented '^dba@309^', "method dba.catalog()"
    @query "select * from sqlite_schema order by type desc, name;"

  #---------------------------------------------------------------------------------------------------------
  walk_objects: ( cfg ) ->
    validate.dba_walk_objects_cfg ( cfg = { @types.defaults.dba_walk_objects_cfg..., cfg..., } )
    schema      = cfg.schema
    ordering    = cfg._ordering
    return @_walk_all_objects() unless schema?
    schema_i    = @sql.I  schema
    schema_s    = @sql.L  schema
    ordering_x  = if ( ordering is 'drop' ) then 'desc' else 'asc'
    seq         = @first_value @query \
      @sql.SQL"select seq from pragma_database_list where name = #{@sql.L schema};"
    #.......................................................................................................
    return @query @sql.SQL"""
      select
          #{seq}            as seq,
          #{@sql.L schema}  as schema,
          name              as name,
          type              as type,
          sql               as sql
        from #{@sql.I schema}.sqlite_schema
        order by seq, type #{ordering_x}, name;"""

  #---------------------------------------------------------------------------------------------------------
  _walk_all_objects: ->
    schemas   = {}
    parts     = []
    #.......................................................................................................
    ### TAINT use API ###
    for row from @query "select seq, name, file as path from pragma_database_list order by seq;"
      schemas[ row.name ] = row
    #.......................................................................................................
    for schema, d of schemas
      schema_i    = @sql.I  schema
      schema_s    = @sql.L  schema
      parts.push """select
          #{d.seq} as seq,
          #{schema_s} as schema,
          name  as name,
          type  as type,
          sql   as sql
        from #{schema_i}.sqlite_schema as d1"""
    parts     = parts.join " union all\n"
    #.......................................................................................................
    sql       = ''
    sql      += parts
    sql      += "\norder by seq, type, name;"
    return @query sql

  #---------------------------------------------------------------------------------------------------------
  is_empty: ( cfg ) ->
    validate.dba_is_empty_cfg ( cfg = { @types.defaults.dba_is_empty_cfg..., cfg..., } )
    return ( has_schema = @_is_empty_schema @sql.I schema ) unless name?
    throw new E.Dba_not_implemented '^dba@310^', "dba.is_empty() for anything but schemas (got #{rpr cfg})"

  #---------------------------------------------------------------------------------------------------------
  _is_empty_schema: ( schema_i ) -> (
    @list @query "select 1 from #{schema_i}.sqlite_schema limit 1;" ).length is 0

  #---------------------------------------------------------------------------------------------------------
  list_schemas:       -> @list @query "select * from pragma_database_list order by name;"
  list_schema_names:  -> ( d.name for d in @list_schemas() )

  #---------------------------------------------------------------------------------------------------------
  has: ( cfg ) ->
    validate.dba_has_cfg ( cfg = { @types.defaults.dba_has_cfg..., cfg..., } )
    return cfg.schema in @list_schema_names()

  #---------------------------------------------------------------------------------------------------------
  get_schemas: ->
    R             = {}
    R[ row.name ] = row.file for row from @query "select * from pragma_database_list order by seq;"
    return R

  #---------------------------------------------------------------------------------------------------------
  _path_of_schema: ( schema, fallback = misfit ) ->
    R = @first_value @query "select file from pragma_database_list where name = ?;", [ schema, ]
    return R if R?
    return fallback unless fallback is misfit
    throw new E.Dba_schema_unknown '^dba@311^', schema

  #---------------------------------------------------------------------------------------------------------
  type_of: ( name, schema = 'main' ) ->
    for row from @catalog()
      return row.type if row.name is name
    return null

  #---------------------------------------------------------------------------------------------------------
  column_types: ( table ) ->
    R = {}
    ### TAINT we apparently have to call the pragma in this roundabout fashion since SQLite refuses to
    accept placeholders in that statement: ###
    for row from @query @interpolate "pragma table_info( $table );", { table, }
      R[ row.name ] = row.type
    return R

  #---------------------------------------------------------------------------------------------------------
  _dependencies_of: ( table, schema = 'main' ) ->
    return @query "pragma #{@sql.I schema}.foreign_key_list( #{@sql.I table} )"

  #---------------------------------------------------------------------------------------------------------
  dependencies_of:  ( table, schema = 'main' ) ->
    validate.ic_schema schema
    return ( row.table for row from @_dependencies_of table )


  #=========================================================================================================
  # DB STRUCTURE MODIFICATION
  #---------------------------------------------------------------------------------------------------------
  # ### TAINT Error: index associated with UNIQUE or PRIMARY KEY constraint cannot be dropped ###
  # clear: ( cfg ) ->
  #   validate.ic_schema schema
  #   schema_i      = @sql.I schema
  #   R             = 0
  #   fk_state      = @_get_foreign_key_state()
  #   @_set_foreign_key_state off
  #   for { type, name, } in @list @walk_objects { schema, _ordering: 'drop', }
  #     statement = "drop #{type} if exists #{@sql.I name};"
  #     @execute statement
  #     R += +1
  #   @_set_foreign_key_state fk_state
  #   return R

  #---------------------------------------------------------------------------------------------------------
  _open_file_db_in_ram: ( cfg ) ->
    ### Given a `path` and a `schema`, create a temporary schema to open the file DB in as well as an empty
    in-memory schema; then copy all DB objects and their contents from the temporary file schema to the RAM
    schema. Finally, detach the file schema. Ensure the `path` given is kept around as the `saveas`
    (implicit) path to be used for eventual persistency (`dba.save()`). ###
    ### TAINT validate? ###
    schema_main_allowed = not @_initialized
    { path, schema, saveas, } = cfg
    return @_attach { schema, path, saveas, } if @types.isa.dba_ram_path path
    #.......................................................................................................
    tmp_schema = @_get_free_temp_schema()
    @_attach { schema: tmp_schema, path, }
    unless ( schema is 'main' ) and schema_main_allowed
      @_attach { schema, path: '', saveas, }
    @_copy_schema { from_schema: tmp_schema, to_schema: schema, }
    @_detach { schema: tmp_schema, }
    #.......................................................................................................
    @_schemas = lets @_schemas, ( d ) => d[ schema ] = { path: saveas, } ### TAINT use API call ###
    return null

  #---------------------------------------------------------------------------------------------------------
  _attach: ( cfg ) ->
    ### Given a `path` and a `schema`, execute SQL"attach $path as $schema".

    `_attach()` will fail
      * if `schema` already exists, or
      * if the maximum number of schemas (10 by default) has already been attached, or
      * if the schema name is `main` and the DBA is `@_initialized`.

    If `@_initialized` is `false`, then a new `better-sqlite3` instance with a `main` schema will be
    created;
      * if the `schema` passed in is `main`, it will be opened from the `path` given.
      * If `schema` is not `main`, `amin` will be opened as an empty RAM DB, and `schema` will be attached
        from the file given.
    ###
    validate.dba_attach_cfg ( cfg = { @types.defaults.dba_attach_cfg..., cfg..., } )
    { path, schema, saveas, }   = cfg
    #.......................................................................................................
    unless @_initialized
      if schema is 'main'
        # @sqlt = new_bsqlt3_connection path, @_bsqlt3_cfg
        def @, 'sqlt', enumerable: false, configurable: false, value: new_bsqlt3_connection path, @_bsqlt3_cfg
        @_schemas = lets @_schemas, ( d ) => d[ schema ] = { path: saveas, } ### TAINT use API call ###
        return null
      ignore = @sqlt
      # @sqlt = new_bsqlt3_connection '', @_bsqlt3_cfg
    #.......................................................................................................
    if @has { schema, }
      throw new E.Dba_schema_exists '^dba@312^', schema
    #.......................................................................................................
    try
      @run "attach ? as ?;", [ path, schema, ]
    catch error
      throw error unless error.code is 'SQLITE_ERROR'
      throw new E.Dba_sqlite_too_many_dbs '^dba@313^', schema if error.message.startsWith 'too many attached databases'
      throw new E.Dba_sqlite_error        '^dba@314^', error
    @_schemas = lets @_schemas, ( d ) => d[ schema ] = { path: saveas, } ### TAINT use API call ###
    return null

  #---------------------------------------------------------------------------------------------------------
  _detach: ( cfg ) ->
    validate.dba_detach_cfg ( cfg = { @types.defaults.dba_detach_cfg..., cfg..., } )
    @execute @sql.SQL"detach #{@sql.I cfg.schema};"
    @_schemas     = lets @_schemas, ( d ) => delete d[ cfg.schema ]
    return null


  #=========================================================================================================
  # IN-MEMORY PROCESSING
  #-----------------------------------------------------------------------------------------------------------
  _move_schema: ( cfg ) -> @_copy_or_move_schema cfg, true
  _copy_schema: ( cfg ) -> @_copy_or_move_schema cfg, false

  #-----------------------------------------------------------------------------------------------------------
  _copy_or_move_schema: ( cfg, detach_schema = false ) ->
    detach_from_schema = ->
      return null unless detach_schema
      return @_detach { schema: from_schema, }
    #.......................................................................................................
    validate.copy_or_move_schema_cfg ( cfg = { @types.defaults.copy_or_move_schema_cfg..., cfg..., } )
    { from_schema, to_schema, } = cfg
    #.......................................................................................................
    if from_schema is to_schema
      throw new E.Dba_schema_repeated '^dba@315^', from_schema
    #.......................................................................................................
    known_schemas     = @list_schema_names()
    throw new E.Dba_schema_unknown '^dba@316^', from_schema unless from_schema in known_schemas
    throw new E.Dba_schema_unknown '^dba@317^', to_schema   unless to_schema   in known_schemas
    #.......................................................................................................
    to_schema_objects = @list @walk_objects { schema: to_schema, }
    if to_schema_objects.length > 0
      throw new E.Dba_schema_nonempty '^dba@318^', to_schema
    #.......................................................................................................
    from_schema_objects = @list @walk_objects { schema: from_schema }
    return detach_from_schema() if from_schema_objects.length is 0
    #.......................................................................................................
    to_schema_x   = @sql.I to_schema
    from_schema_x = @sql.I from_schema
    inserts       = []
    fk_state      = @_get_foreign_key_state()
    @_set_foreign_key_state off
    #.......................................................................................................
    for d in from_schema_objects
      continue if ( not d.sql? ) or ( d.sql is '' )
      continue if d.name in [ 'sqlite_sequence', ]
      #.....................................................................................................
      ### TAINT consider to use `validate.ic_db_object_type` ###
      unless d.type in [ 'table', 'view', 'index', ]
        throw new E.Dba_unexpected_db_object_type '^dba@319^', d.type, d
      #.....................................................................................................
      ### TAINT using not-so reliable string replacement as substitute for proper parsing ###
      name_x  = @sql.I d.name
      sql     = d.sql.replace /\s*CREATE\s*(TABLE|INDEX|VIEW)\s*/i, "create #{d.type} #{to_schema_x}."
      #.....................................................................................................
      if sql is d.sql
        throw new E.Dba_unexpected_sql '^dba@320^', d.sql
      #.....................................................................................................
      @execute sql
      if d.type is 'table'
        inserts.push "insert into #{to_schema_x}.#{name_x} select * from #{from_schema_x}.#{name_x};"
    #.......................................................................................................
    @execute sql for sql in inserts
    @_set_foreign_key_state fk_state
    @pragma "#{@sql.I to_schema}.foreign_key_check;" if fk_state
    return detach_from_schema()





  #=========================================================================================================
  # SORTABLE LISTS
  #---------------------------------------------------------------------------------------------------------
  as_hollerith:   ( x ) -> HOLLERITH.encode x
  from_hollerith: ( x ) -> HOLLERITH.decode x


