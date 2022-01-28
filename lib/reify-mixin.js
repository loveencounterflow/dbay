(function() {
  'use strict';
  var CND, E, SQL, badge, debug, guy, rpr;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'DBAY/MIXIN/REIFY';

  debug = CND.get_logger('debug', badge);

  //...........................................................................................................
  guy = require('guy');

  E = require('./errors');

  SQL = String.raw;

  //===========================================================================================================
  this.DBay_reify = (clasz = Object) => {
    return class extends clasz {
      // #---------------------------------------------------------------------------------------------------------
      // _$reify_initialize: ->
      //   guy.props.def @_me, '_statements', { enumerable: false, value: {}, }
      //   return undefined

        //---------------------------------------------------------------------------------------------------------
      _rf_get_primary_keys(cfg) {
        var R, i, len, row, schema;
        ({schema} = this.cfg);
        R = this.all_rows(SQL`select 
    -- pk                          as nr,
    $table                      as "table",
    name                        as field, 
    lower( type )               as type,
    not "notnull"               as nullable
  from ${schema}.pragma_table_info( $table )
  where true 
    and ( pk > 0 )
  order by pk;`, cfg);
        for (i = 0, len = R.length; i < len; i++) {
          row = R[i];
          row.nullable = !!row.nullable;
        }
        return R;
      }

      //---------------------------------------------------------------------------------------------------------
      _rf_get_foreign_keys(cfg) {
        var R, schema;
        ({schema} = this.cfg);
        R = this.all_rows(SQL`select 
    $table                      as from_table,
    "from"                      as from_field,
    "table"                     as to_table,
    coalesce( "to", "from" )    as to_field
  from ${schema}.pragma_foreign_key_list( $table )
  order by seq;`, cfg);
        return R;
      }

      //---------------------------------------------------------------------------------------------------------
      _rf_get_foreign_key_by_from_fields(cfg) {
        var R, ref, row, schema;
        ({schema} = this.cfg);
        R = {};
        ref = this.query(SQL`select 
    "from"                      as from_field,
    "table"                     as to_table,
    coalesce( "to", "from" )    as to_field
  from ${schema}.pragma_foreign_key_list( $table );`, cfg);
        for (row of ref) {
          R[row.from_field] = {
            table: row.to_table,
            field: row.to_field
          };
        }
        return R;
      }

      //---------------------------------------------------------------------------------------------------------
      _get_primary_key_clause(cfg) {
        var I, pk, pk_names, pks;
        ({I} = this.sql);
        pks = this._rf_get_primary_keys(cfg);
        pk_names = ((function() {
          var i, len, results;
          results = [];
          for (i = 0, len = pks.length; i < len; i++) {
            pk = pks[i];
            results.push(I(pk.field));
          }
          return results;
        })()).join(', ');
        return SQL`primary key ( ${pk_names} )`;
      }

      //---------------------------------------------------------------------------------------------------------
      _get_foreign_key_clauses(cfg) {
        var I, R, field, from_field, ref, table;
        ({I} = this.sql);
        R = {};
        ref = this._rf_get_foreign_key_by_from_fields(cfg);
        for (from_field in ref) {
          ({table, field} = ref[from_field]);
          R[from_field] = `references ${I(table)} ( ${I(field)} )`;
        }
        return R;
      }

    };
  };

}).call(this);

//# sourceMappingURL=reify-mixin.js.map