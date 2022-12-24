
'use strict'


############################################################################################################
E                         = require './errors'
SQL                       = String.raw


#===========================================================================================================
@DBay_sqlgen = ( clasz = Object ) => class extends clasz

  # #---------------------------------------------------------------------------------------------------------
  # _$sqlgen_initialize: ->
  #   guy.props.def @_me, '_statements', { enumerable: false, value: {}, }
  #   return undefined

  #---------------------------------------------------------------------------------------------------------
  prepare_insert: ( cfg ) -> @prepare @create_insert cfg
  create_insert: ( cfg ) ->
    @types.validate.dbay_create_insert_cfg ( cfg = { @constructor.C.defaults.dbay_create_insert_cfg..., cfg..., } )
    { L, I, V, }  = @sql
    if cfg.fields?
      fields = cfg.fields
    else
      fields = @_get_field_names cfg.schema, cfg.into
      fields = ( field for field in fields when field not in cfg.exclude ) if cfg.exclude?
    R             = []
    R.push "insert into #{I cfg.schema}.#{I cfg.into}"
    if fields.length is 0
      R.push " default values"
    else
      R.push " ( "
      R.push ( ( I field ) for field in fields ).join ', '
      R.push " ) values ( "
      ### TAINT how to escape dollar placeholders??? ###
      R.push ( ( "$#{field}" ) for field in fields ).join ', '
      if cfg.on_conflict
        R.push " ) "
        switch ( type = @types.type_of cfg.on_conflict )
          when 'text'
            R.push "on conflict #{cfg.on_conflict}"
          when 'object'
            ### `cfg.on_conflict.update` is `true` ###
            R.push "on conflict do update set "
            R.push ( "#{I field} = excluded.#{I field}" for field in fields ).join ', '
          else
            throw new E.DBay_wrong_type '^dbay/sqlgen@1^', "a nonempty_text or an object", type
      else
        R.push " )"
    R.push " returning #{cfg.returning}" if cfg.returning?
    R.push ";"
    return R.join ''

  #---------------------------------------------------------------------------------------------------------
  _get_field_names: ( schema, name ) ->
    schema_i  = @sql.I schema
    statement = @prepare SQL"select name from #{schema_i}.pragma_table_info( $name );"
    statement.raw true
    R         = ( row[ 0 ] for row from statement.iterate { name, } )
    throw new E.DBay_object_unknown '^dbay/sqlgen@1^', schema, name if R.length is 0
    return R

  # #---------------------------------------------------------------------------------------------------------
  # _get_fields: ( schema, name ) ->
  #   ### TAINT rewrite; see above ###
  #   # @types.validate.dbay_fields_of_cfg ( cfg = { @constructor.C.defaults.dbay_fields_of_cfg..., cfg..., } )
  #   schema_i          = @sql.I schema
  #   R                 = []
  #   for d from @all_rows SQL"select * from #{schema_i}.pragma_table_info( $name );", { name, }
  #     # { cid: 0, name: 'id', type: 'integer', notnull: 1, dflt_value: null, pk: 1 }
  #     type = if d.type is '' then null else d.type
  #     R.push {
  #       idx:      d.cid
  #       type:     type
  #       name:     d.name
  #       optional: !d.notnull
  #       default:  d.dflt_value
  #       is_pk:    !!d.pk }
  #   throw new E.DBay_object_unknown '^dbay/sqlgen@1^', schema, name if R.length is 0
  #   return R







