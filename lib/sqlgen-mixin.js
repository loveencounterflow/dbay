(function() {
  'use strict';
  var CND, E, SQL, badge, debug, guy, rpr,
    indexOf = [].indexOf;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'DBAY/MIXIN/SQLGEN';

  debug = CND.get_logger('debug', badge);

  //...........................................................................................................
  guy = require('guy');

  E = require('./errors');

  SQL = String.raw;

  //===========================================================================================================
  this.DBay_sqlgen = (clasz = Object) => {
    return class extends clasz {
      // #---------------------------------------------------------------------------------------------------------
      // _$sqlgen_initialize: ->
      //   guy.props.def @_me, '_statements', { enumerable: false, value: {}, }
      //   return undefined

        //---------------------------------------------------------------------------------------------------------
      prepare_insert(cfg) {
        return this.prepare(this.create_insert(cfg));
      }

      create_insert(cfg) {
        var I, L, R, V, field, fields;
        this.types.validate.dbay_create_insert_cfg((cfg = {...this.constructor.C.defaults.dbay_create_insert_cfg, ...cfg}));
        ({L, I, V} = this.sql);
        if (cfg.fields != null) {
          fields = cfg.fields;
        } else {
          fields = this._get_field_names(cfg.schema, cfg.into);
          if (cfg.exclude != null) {
            fields = (function() {
              var i, len, results;
              results = [];
              for (i = 0, len = fields.length; i < len; i++) {
                field = fields[i];
                if (indexOf.call(cfg.exclude, field) < 0) {
                  results.push(field);
                }
              }
              return results;
            })();
          }
        }
        R = [];
        R.push(`insert into ${I(cfg.schema)}.${I(cfg.into)} (`);
        R.push(((function() {
          var i, len, results;
          results = [];
          for (i = 0, len = fields.length; i < len; i++) {
            field = fields[i];
            results.push(I(field));
          }
          return results;
        })()).join(', '));
        R.push(") values (");
        /* TAINT how to escape dollar placeholders??? */
        R.push(((function() {
          var i, len, results;
          results = [];
          for (i = 0, len = fields.length; i < len; i++) {
            field = fields[i];
            results.push(`$${field}`);
          }
          return results;
        })()).join(', '));
        R.push(");");
        return R.join(' ');
      }

      //---------------------------------------------------------------------------------------------------------
      _get_field_names(schema, name) {
        var R, row, schema_i, statement;
        schema_i = this.sql.I(schema);
        statement = this.prepare(SQL`select name from ${schema_i}.pragma_table_info( $name );`);
        statement.raw(true);
        R = (function() {
          var ref, results;
          ref = statement.iterate({name});
          results = [];
          for (row of ref) {
            results.push(row[0]);
          }
          return results;
        })();
        if (R.length === 0) {
          throw new E.DBay_object_unknown('^dbay/sqlgen@1^', schema, name);
        }
        return R;
      }

    };
  };

  // #---------------------------------------------------------------------------------------------------------
// _get_fields: ( schema, name ) ->
//   ### TAINT rewrite; see above ###
//   # @types.validate.dbay_fields_of_cfg ( cfg = { @constructor.C.defaults.dbay_fields_of_cfg..., cfg..., } )
//   schema_i          = @sql.I schema
//   R                 = []
//   for d from @all_rows SQL"select * from #{schema_i}.pragma_table_info( $name );", { name, }
//     # { cid: 0, name: 'id', type: 'integer', notnull: 1, dflt_value: null, pk: 1 }
//     type = if d.type is '' then null else d.type
//     R.push {
//       idx:      d.cid
//       type:     type
//       name:     d.name
//       optional: !d.notnull
//       default:  d.dflt_value
//       is_pk:    !!d.pk }
//   throw new E.DBay_object_unknown '^dbay/sqlgen@1^', schema, name if R.length is 0
//   return R

}).call(this);

//# sourceMappingURL=sqlgen-mixin.js.map