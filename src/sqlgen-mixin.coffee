
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'DBAY/MIXIN/SQLGEN'
debug                     = CND.get_logger 'debug',     badge
#...........................................................................................................
guy                       = require 'guy'
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
      fields = ( field for field in fields when not field in cfg.exclude ) if cfg.exclude?
    R             = []
    R.push "insert into #{I cfg.schema}.#{I cfg.into} ("
    debug '^34937534^', fields
    R.push ( ( I field ) for field in fields ).join ', '
    R.push ") values ("
    ### TAINT how to escape dollar placeholders??? ###
    R.push ( ( "$#{field}" ) for field in fields ).join ', '
    R.push ");"
    return R.join ' '

  #---------------------------------------------------------------------------------------------------------
  _get_field_names: ( schema, name ) -> ( d.name for d in @_get_fields schema, name )

  #---------------------------------------------------------------------------------------------------------
  _get_fields: ( schema, name ) ->
    # @types.validate.dbay_fields_of_cfg ( cfg = { @constructor.C.defaults.dbay_fields_of_cfg..., cfg..., } )
    schema_i          = @sql.I schema
    R                 = []
    for d from @all_rows SQL"select * from #{schema_i}.pragma_table_info( $name );", { name, }
      # { cid: 0, name: 'id', type: 'integer', notnull: 1, dflt_value: null, pk: 1 }
      type = if d.type is '' then null else d.type
      R.push {
        idx:      d.cid
        type:     type
        name:     d.name
        optional: !d.notnull
        default:  d.dflt_value
        is_pk:    !!d.pk }
    throw new E.DBay_object_unknown '^dbay/sqlgen@1^', schema, name if R.length is 0
    return R







